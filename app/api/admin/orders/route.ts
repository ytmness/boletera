import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/supabase-auth";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/orders
 * Obtener lista de órdenes con filtros
 * Query params: ?eventId=xxx&status=PAID&search=email
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const paymentStatus = searchParams.get('status');
    const search = searchParams.get('search');

    // Construir filtros dinámicos
    const where: any = {};

    if (eventId && eventId !== 'all') {
      where.eventId = eventId;
    }

    if (paymentStatus && paymentStatus !== 'all') {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.OR = [
        { buyerName: { contains: search, mode: 'insensitive' } },
        { buyerEmail: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.sale.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            artist: true,
            eventDate: true,
          },
        },
        saleItems: {
          include: {
            ticketType: {
              select: {
                name: true,
                price: true,
                category: true,
              },
            },
          },
        },
        tickets: {
          select: {
            id: true,
            ticketNumber: true,
            isQrVisible: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: orders.map(order => ({
        id: order.id,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        buyerPhone: order.buyerPhone,
        event: order.event,
        total: Number(order.total),
        paymentStatus: order.paymentStatus,
        paymentReference: order.paymentReference,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        saleItems: order.saleItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          isTable: item.isTable,
          tableNumber: item.tableNumber,
          ticketType: item.ticketType,
        })),
        tickets: order.tickets,
        ticketCount: order.tickets.length,
        visibleQrCount: order.tickets.filter(t => t.isQrVisible).length,
      })),
    });
  } catch (error: any) {
    console.error("[ORDERS] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener órdenes" },
      { status: 500 }
    );
  }
}
