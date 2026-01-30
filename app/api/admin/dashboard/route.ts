import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/supabase-auth";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/dashboard
 * Obtener métricas del dashboard
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

    // Obtener todos los eventos activos
    const events = await prisma.event.findMany({
      where: { isActive: true },
      include: {
        ticketTypes: true,
        sales: {
          where: {
            paymentStatus: "PAID",
          },
        },
      },
      orderBy: { eventDate: 'asc' },
    });

    // Calcular métricas por evento
    const eventMetrics = events.map((event) => {
      const totalCapacity = event.ticketTypes.reduce(
        (sum, tt) => sum + tt.maxQuantity,
        0
      );
      
      const totalSold = event.ticketTypes.reduce(
        (sum, tt) => sum + tt.soldQuantity,
        0
      );

      const totalRevenue = event.sales.reduce(
        (sum, sale) => sum + Number(sale.total),
        0
      );

      const percentageSold = totalCapacity > 0 
        ? (totalSold / totalCapacity) * 100 
        : 0;

      return {
        id: event.id,
        name: event.name,
        artist: event.artist,
        eventDate: event.eventDate,
        venue: event.venue,
        totalCapacity,
        totalSold,
        totalAvailable: totalCapacity - totalSold,
        percentageSold: Math.round(percentageSold * 10) / 10,
        totalRevenue,
        totalOrders: event.sales.length,
      };
    });

    // Métricas globales
    const totalRevenue = eventMetrics.reduce((sum, e) => sum + e.totalRevenue, 0);
    const totalTicketsSold = eventMetrics.reduce((sum, e) => sum + e.totalSold, 0);
    const totalOrders = eventMetrics.reduce((sum, e) => sum + e.totalOrders, 0);

    // Órdenes recientes
    const recentOrders = await prisma.sale.findMany({
      where: {
        paymentStatus: "PAID",
      },
      include: {
        event: {
          select: {
            name: true,
            artist: true,
          },
        },
        saleItems: {
          include: {
            ticketType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalTicketsSold,
          totalOrders,
          totalEvents: events.length,
        },
        eventMetrics,
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          buyerName: order.buyerName,
          buyerEmail: order.buyerEmail,
          eventName: order.event.name,
          eventArtist: order.event.artist,
          total: Number(order.total),
          ticketCount: order.saleItems.reduce((sum, item) => sum + item.quantity, 0),
          createdAt: order.createdAt,
          paymentStatus: order.paymentStatus,
        })),
      },
    });
  } catch (error: any) {
    console.error("[DASHBOARD] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener métricas" },
      { status: 500 }
    );
  }
}
