import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "tu-secret-super-seguro-cambiar-en-produccion"
);

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "VENDEDOR" | "SUPERVISOR" | "ACCESOS";
}

/**
 * Hashea una contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verifica una contraseña contra su hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Crea un token JWT
 */
export async function createToken(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // 7 días
    .sign(secret);

  return token;
}

/**
 * Verifica y decodifica un token JWT
 */
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.user as SessionUser;
  } catch (error) {
    return null;
  }
}

/**
 * Obtiene el usuario de la sesión actual
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Crea una sesión (guarda el token en cookie)
 */
export async function createSession(user: SessionUser) {
  const token = await createToken(user);
  const cookieStore = await cookies();

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: "/",
  });
}

/**
 * Destruye la sesión actual
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

/**
 * Verifica que el usuario tenga uno de los roles permitidos
 */
export function hasRole(
  user: SessionUser | null,
  allowedRoles: SessionUser["role"][]
): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
