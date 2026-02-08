import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/supabase-auth";

// Marcar como dinámica porque usa cookies
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/session
 * Obtener el usuario actual desde Supabase Auth
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ success: false, data: null }, { status: 200 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { user } 
    });
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json({ success: false, data: null }, { status: 200 });
  }
}

