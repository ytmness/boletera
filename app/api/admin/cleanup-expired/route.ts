import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/supabase-auth";

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/cleanup-expired
 * Marca como EXPIRED las órdenes PENDING que tienen más de 10 minutos
 * Solo ADMIN puede ejecutar esto
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    // Fecha hace 10 minutos
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Buscar ventas PENDING creadas hace más de 10 minutos
    const expiredSales = await prisma.sale.findMany({
      where: {
        paymentStatus: "PENDING",
        createdAt: {
          lt: tenMinutesAgo,
        },
      },
      select: {
        id: true,
        createdAt: true,
        buyerEmail: true,
      },
    });

    if (expiredSales.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay órdenes expiradas",
        expired: 0,
      });
    }

    // Actualizar a EXPIRED
    const result = await prisma.sale.updateMany({
      where: {
        id: {
          in: expiredSales.map(s => s.id),
        },
      },
      data: {
        paymentStatus: "EXPIRED",
        status: "CANCELLED",
      },
    });

    console.log(`[CLEANUP] ${result.count} órdenes marcadas como EXPIRED`);

    return NextResponse.json({
      success: true,
      message: `${result.count} órdenes marcadas como expiradas`,
      expired: result.count,
      details: expiredSales.map(s => ({
        id: s.id,
        email: s.buyerEmail,
        createdAt: s.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("[CLEANUP EXPIRED] Error:", error);
    return NextResponse.json(
      { error: "Error al limpiar órdenes expiradas" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/cleanup-expired
 * Solo devuelve cuántas órdenes están expiradas (sin modificar)
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

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const count = await prisma.sale.count({
      where: {
        paymentStatus: "PENDING",
        createdAt: {
          lt: tenMinutesAgo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      expiredCount: count,
    });
  } catch (error: any) {
    console.error("[CLEANUP EXPIRED GET] Error:", error);
    return NextResponse.json(
      { error: "Error al contar órdenes expiradas" },
      { status: 500 }
    );
  }
}
