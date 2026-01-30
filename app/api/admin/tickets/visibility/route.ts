import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/supabase-auth";

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/tickets/visibility
 * Actualizar visibilidad de QR de uno o varios tickets
 * Body: { ticketIds: string[], isVisible: boolean }
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

    const body = await request.json();
    const { ticketIds, isVisible } = body;

    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return NextResponse.json(
        { error: "ticketIds debe ser un array no vacío" },
        { status: 400 }
      );
    }

    if (typeof isVisible !== 'boolean') {
      return NextResponse.json(
        { error: "isVisible debe ser booleano" },
        { status: 400 }
      );
    }

    // Actualizar visibilidad de los tickets
    const result = await prisma.ticket.updateMany({
      where: {
        id: { in: ticketIds },
      },
      data: {
        isQrVisible: isVisible,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} ticket(s) actualizados`,
      data: {
        updatedCount: result.count,
        isVisible,
      },
    });
  } catch (error: any) {
    console.error("[TICKET VISIBILITY] Error:", error);
    return NextResponse.json(
      { error: "Error al actualizar visibilidad" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/tickets/visibility
 * Actualizar visibilidad de todos los tickets de una orden
 * Body: { saleId: string, isVisible: boolean }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getSession();
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { saleId, isVisible } = body;

    if (!saleId) {
      return NextResponse.json(
        { error: "saleId es requerido" },
        { status: 400 }
      );
    }

    if (typeof isVisible !== 'boolean') {
      return NextResponse.json(
        { error: "isVisible debe ser booleano" },
        { status: 400 }
      );
    }

    // Actualizar todos los tickets de la orden
    const result = await prisma.ticket.updateMany({
      where: {
        saleId: saleId,
      },
      data: {
        isQrVisible: isVisible,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Todos los tickets de la orden actualizados`,
      data: {
        updatedCount: result.count,
        isVisible,
      },
    });
  } catch (error: any) {
    console.error("[TICKET VISIBILITY BATCH] Error:", error);
    return NextResponse.json(
      { error: "Error al actualizar visibilidad" },
      { status: 500 }
    );
  }
}
