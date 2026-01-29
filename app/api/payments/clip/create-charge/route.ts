import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createClipCharge } from "@/lib/payments/clip";

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/clip/create-charge
 * Crea un cargo en Clip usando Checkout Transparente (token del SDK)
 * 
 * IMPORTANTE: Requiere certificación PCI-DSS Nivel 1 y permisos de Clip
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

    // Calcular monto total desde SaleItems (en centavos)
    const totalAmount = sale.totalAmount || Math.round(Number(sale.total) * 100);

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

    // Crear cargo en Clip usando el token
    const chargeResponse = await createClipCharge({
      amount: totalAmount,
      currency: sale.currency || "MXN",
      token,
      description,
      reference: saleId,
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
      // Crear tickets a partir de los saleItems
      const tickets = [];
      for (const saleItem of sale.saleItems) {
        for (let i = 0; i < saleItem.quantity; i++) {
          tickets.push({
            saleId: sale.id,
            ticketTypeId: saleItem.ticketTypeId,
            seatNumber: saleItem.isTable && saleItem.seatsPerTable 
              ? (saleItem.tableNumber || 0) * 100 + (i + 1)
              : null,
            tableNumber: saleItem.isTable ? saleItem.tableNumber : null,
            qrCode: `TICKET-${sale.id}-${saleItem.id}-${i}`,
          });
        }
      }

      // Crear tickets en batch
      await prisma.ticket.createMany({
        data: tickets,
      });

      // Incrementar soldQuantity de cada ticketType
      for (const saleItem of sale.saleItems) {
        await prisma.ticketType.update({
          where: { id: saleItem.ticketTypeId },
          data: {
            soldQuantity: {
              increment: saleItem.quantity,
            },
          },
        });
      }
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
