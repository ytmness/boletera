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

    // Crear el evento
    const event = await prisma.event.create({
      data: {
        name,
        artist,
        venue,
        eventDate: new Date(eventDate),
        eventTime,
        description: description || "",
        imageUrl: "/images/default-event.jpg", // Imagen por defecto
        status: "active",
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
