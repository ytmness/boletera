import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const dynamic = 'force-dynamic';

/**
 * GET /api/sales/[id]
 * Obtiene el estado y detalles de una venta
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const saleId = params.id;

    if (!saleId) {
      return NextResponse.json(
        { error: "saleId es requerido" },
        { status: 400 }
      );
    }

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            artist: true,
            venue: true,
            eventDate: true,
            eventTime: true,
          },
        },
        saleItems: {
          include: {
            ticketType: {
              select: {
                id: true,
                name: true,
                category: true,
                price: true,
                isTable: true,
                seatsPerTable: true,
              },
            },
          },
        },
        tickets: {
          select: {
            id: true,
            ticketNumber: true,
            qrCode: true,
            status: true,
            tableNumber: true,
            seatNumber: true,
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si la reserva expiró
    const isExpired = sale.expiresAt && sale.expiresAt < new Date() && sale.status === "PENDING";

    return NextResponse.json({
      success: true,
      data: {
        id: sale.id,
        status: sale.status,
        paymentStatus: sale.paymentStatus,
        paymentProvider: sale.paymentProvider,
        paymentReference: sale.paymentReference,
        isExpired,
        expiresAt: sale.expiresAt,
        paidAt: sale.paidAt,
        subtotal: Number(sale.subtotal),
        tax: Number(sale.tax),
        total: Number(sale.total),
        totalAmount: sale.totalAmount,
        currency: sale.currency,
        buyerName: sale.buyerName,
        buyerEmail: sale.buyerEmail,
        buyerPhone: sale.buyerPhone,
        event: sale.event,
        saleItems: sale.saleItems, // Cambiar items → saleItems
        tickets: sale.tickets,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching sale:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al obtener la venta",
      },
      { status: 500 }
    );
  }
}
