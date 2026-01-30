import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/supabase-auth";

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/events
 * Crear nuevo evento (solo ADMIN)
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
    const { name, artist, venue, eventDate, eventTime, description } = body;

    // Validación básica
    if (!name || !artist || !venue || !eventDate || !eventTime) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Crear fechas de inicio y fin de ventas (30 días antes y hasta el día del evento)
    const eventDateObj = new Date(eventDate);
    const salesStartDate = new Date();
    const salesEndDate = new Date(eventDateObj);

    // Crear el evento
    const event = await prisma.event.create({
      data: {
        name,
        artist,
        venue,
        eventDate: eventDateObj,
        eventTime,
        description: description || "",
        imageUrl: "/images/default-event.jpg", // Imagen por defecto
        isActive: true,
        maxCapacity: 5000, // Valor por defecto, se puede actualizar después
        salesStartDate,
        salesEndDate,
      },
    });

    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error("[ADMIN EVENTS POST] Error:", error);
    return NextResponse.json(
      { error: "Error al crear evento" },
      { status: 500 }
    );
  }
}
