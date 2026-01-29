import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createClipCheckoutLink } from "@/lib/payments/clip";

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/clip/create-link
 * Crea un link de pago en Clip para una venta existente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { saleId } = body;

    if (!saleId) {
      return NextResponse.json(
        { error: "saleId es requerido" },
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

    // Verificar que no tenga ya un link de pago creado
    if (sale.paymentReference) {
      // Si ya existe, verificar si el link sigue siendo válido
      // Por ahora, permitimos crear uno nuevo si el anterior falló
      console.log(`Sale ${saleId} ya tiene paymentReference: ${sale.paymentReference}`);
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

    // URLs de retorno
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/checkout/success?saleId=${saleId}`;
    const cancelUrl = `${baseUrl}/checkout/cancel?saleId=${saleId}`;
    const webhookUrl = `${baseUrl}/api/webhooks/clip`;

    // Crear link de pago en Clip
    const clipResponse = await createClipCheckoutLink({
      amount: totalAmount,
      currency: sale.currency || "MXN",
      description,
      reference: saleId,
      successUrl,
      cancelUrl,
      webhookUrl,
      expiresAt: sale.expiresAt || undefined,
    });

    // Actualizar la venta con la referencia de pago
    await prisma.sale.update({
      where: { id: saleId },
      data: {
        paymentProvider: "CLIP",
        paymentReference: clipResponse.checkoutId || clipResponse.paymentRequestCode || "",
        paymentStatus: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentUrl: clipResponse.paymentUrl,
        checkoutId: clipResponse.checkoutId,
        saleId,
      },
    });
  } catch (error) {
    console.error("Error creating Clip payment link:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al crear link de pago",
      },
      { status: 500 }
    );
  }
}
