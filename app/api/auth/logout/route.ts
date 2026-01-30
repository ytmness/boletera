import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/auth/supabase-auth";

// Marcar como dinámica porque usa cookies
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/logout
 * Cerrar sesión del usuario
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Cerrar sesión en Supabase Auth
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("[LOGOUT] Error al cerrar sesión:", error);
      return NextResponse.json(
        { error: "Error al cerrar sesión" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sesión cerrada exitosamente",
    });
  } catch (error: any) {
    console.error("[LOGOUT] Error general:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
