import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createClipCharge } from "@/lib/payments/clip";
import { generateQRHash } from "@/lib/services/qr-generator";

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/clip/create-charge
 * Crea un pago en Clip usando Checkout Transparente (token del SDK)
 * 
 * IMPORTANTE: NO requiere certificación PCI-DSS ya que Clip maneja el formulario
 * Necesitas verificar tu identidad con Clip y obtener una API Key
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { saleId, token } = body;

    if (!saleId || !token) {
      return NextResponse.json(
        { error: "saleId y token son requeridos" },
        { status: 400 }
      );
    }

    // Buscar la venta con sus items y evento
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        saleItems: {
          include: {
            ticketType: true,
          },
        },
        event: true,
      },
    });

    if (!sale) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la venta esté pendiente y no expirada
    if (sale.status !== "PENDING") {
      return NextResponse.json(
        { error: `La venta ya está ${sale.status}` },
        { status: 400 }
      );
    }

    if (sale.expiresAt && sale.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "La reserva ha expirado. Por favor inicia una nueva compra." },
        { status: 400 }
      );
    }

    // Calcular monto total en PESOS (no centavos) según documentación de Clip
    const totalAmount = Number(sale.total);

    // Construir descripción del pago
    const itemsDescription = sale.saleItems
      .map((item) => {
        if (item.isTable) {
          return `${item.quantity} ${item.ticketType.name}${item.tableNumber ? ` (Mesa ${item.tableNumber})` : ""}`;
        }
        return `${item.quantity}x ${item.ticketType.name}`;
      })
      .join(", ");

    const description = `${sale.event.name} - ${itemsDescription}`;

    // Obtener datos del cliente (email/phone) desde el body si están disponibles
    const { customer } = body;

    // Crear cargo en Clip usando el token
    const chargeResponse = await createClipCharge({
      amount: totalAmount, // Monto en PESOS según documentación de Clip
      currency: sale.currency || "MXN",
      token,
      description,
      reference: saleId,
      customer,
    });

    // Actualizar la venta con la referencia de pago
    await prisma.sale.update({
      where: { id: saleId },
      data: {
        paymentProvider: "CLIP",
        paymentReference: chargeResponse.id,
        paymentStatus: chargeResponse.paid ? "PAID" : "PENDING",
        // Si el pago fue aprobado inmediatamente, actualizar el status
        ...(chargeResponse.paid && { status: "COMPLETED" }),
      },
    });

    // Si el pago fue aprobado inmediatamente, procesar los tickets
    if (chargeResponse.paid) {
      // Usar transacción para crear tickets de forma segura
      await prisma.$transaction(
        async (tx) => {
          // Crear tickets a partir de los saleItems
          for (const saleItem of sale.saleItems) {
            const ticketType = saleItem.ticketType;
            
            // Determinar cuántos tickets crear
            let ticketsToCreate: number;
            if (saleItem.isTable) {
              // Para mesas: crear tickets por asientos (seatsPerTable)
              ticketsToCreate = saleItem.seatsPerTable || 4;
            } else {
              // Para boletos normales: crear según quantity
              ticketsToCreate = saleItem.quantity;
            }

            // Obtener el count inicial UNA VEZ antes del loop
            let ticketCount = await tx.ticket.count({
              where: { ticketTypeId: saleItem.ticketTypeId },
            });

            // Crear cada ticket
            for (let i = 0; i < ticketsToCreate; i++) {
              // Incrementar contador local
              ticketCount += 1;
              const ticketNumber = `${sale.event.name.substring(0, 3).toUpperCase()}-${ticketType.name.substring(0, 3).toUpperCase()}-${String(ticketCount).padStart(6, "0")}`;

              // Crear ticket primero para obtener el ID
              const ticket = await tx.ticket.create({
                data: {
                  saleId: sale.id,
                  ticketTypeId: saleItem.ticketTypeId,
                  ticketNumber,
                  qrCode: "TEMP", // Temporal, se actualizará después
                  tableNumber: saleItem.tableNumber ? `Mesa ${saleItem.tableNumber}` : null,
                  seatNumber: saleItem.isTable ? i + 1 : null, // Para mesas: 1, 2, 3, 4
                },
              });

              // Generar QR único con hash SHA-256
              const qrHash = generateQRHash(ticket.id);
              
              // Actualizar ticket con el QR real
              await tx.ticket.update({
                where: { id: ticket.id },
                data: { qrCode: qrHash },
              });
            }

            // Incrementar soldQuantity del TicketType
            // Para mesas: incrementar por cantidad de mesas (quantity)
            // Para boletos normales: incrementar por cantidad de boletos (quantity)
            await tx.ticketType.update({
              where: { id: saleItem.ticketTypeId },
              data: {
                soldQuantity: {
                  increment: saleItem.quantity,
                },
              },
            });
          }
        },
        {
          timeout: 20000, // 20 segundos de timeout
          maxWait: 20000, // Esperar hasta 20 segundos para obtener el lock
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        chargeId: chargeResponse.id,
        status: chargeResponse.status,
        paid: chargeResponse.paid,
        saleId,
      },
    });
  } catch (error) {
    console.error("Error creating Clip charge:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al procesar el pago",
      },
      { status: 500 }
    );
  }
}
