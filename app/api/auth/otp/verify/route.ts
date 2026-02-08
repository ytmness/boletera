import { NextRequest, NextResponse } from "next/server";
import { createServerClient as createSSRClient } from "@supabase/ssr";
import { prisma } from "@/lib/db/prisma";
import { otpVerifySchema } from "@/lib/validations/schemas";

// Marcar como dinámica porque usa cookies
export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/otp/verify
 * Verificar código OTP de 8 dígitos usando Supabase Auth
 */
export async function POST(request: NextRequest) {
  // Crear response primero para que el cliente SSR pueda establecer cookies
  const response = new NextResponse();
  
  try {
    const body = await request.json();
    
    // Validar datos
    const result = otpVerifySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.errors },
        { status: 400 }
      );
    }

    const { email, token } = result.data;

    // Crear cliente Supabase SSR que maneja cookies correctamente
    const supabase = createSSRClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Verificar código OTP
    // Si el usuario no existe en Supabase Auth, se crea automáticamente
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (authError || !authData.user) {
      console.error("[OTP VERIFY] Error:", authError);
      return NextResponse.json(
        { error: authError?.message || "Código OTP inválido o expirado" },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe en nuestra tabla User
    let user = await prisma.user.findUnique({
      where: { email },
    }) as any;

    // Si el usuario no existe en nuestra tabla, significa que está registrándose
    // En este caso, necesitamos que primero se haya llamado a /api/auth/register
    // para guardar el nombre. Por ahora, creamos un usuario básico.
    // TODO: Mejorar este flujo para que el nombre se pase durante el registro
    if (!user) {
      // Crear usuario básico (el nombre debería venir del registro previo)
      // Por ahora usamos el email como nombre temporal
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Nombre temporal basado en email
          role: "CLIENTE",
          isActive: true,
          password: "", // No se usa contraseña con OTP
          emailVerified: true, // Ya está verificado por Supabase Auth
        } as any,
      });
    } else {
      // Usuario existe, actualizar emailVerified
      if (!user.emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
          } as any,
        });
        user.emailVerified = true;
      }
    }

    // Las cookies de sesión se establecen automáticamente por el cliente SSR
    // cuando se usa verifyOtp. Verificar que la sesión se estableció correctamente
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    // Crear el JSON response usando NextResponse.json pero copiar las cookies del response anterior
    const jsonResponse = NextResponse.json({
      success: true,
      message: "Código OTP verificado exitosamente",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      session: session ? {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      } : null,
    });

    // Copiar todas las cookies del response original (que fueron establecidas por el cliente SSR)
    response.cookies.getAll().forEach((cookie) => {
      jsonResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite as any,
        path: cookie.path,
        maxAge: cookie.maxAge,
      });
    });

    return jsonResponse;
  } catch (error: any) {
    console.error("[OTP VERIFY] Error general:", error);
    return NextResponse.json(
      { error: "Error al verificar código OTP", details: error.message },
      { status: 500 }
    );
  }
}

