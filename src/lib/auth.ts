import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { db } from "./db";

const COOKIE = "kastmatch_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET manquant dans .env");
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  // Expire explicitement avec les mêmes attributs que createSession
  // (sinon le cookie peut survivre en prod / derrière Vercel).
  jar.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "TALENT" && payload.role !== "DIRECTOR")
    ) {
      return null;
    }
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function requireSession(role?: Role) {
  const session = await getSession();
  if (!session) {
    throw new AuthError("Non authentifié", 401);
  }
  if (role && session.role !== role) {
    throw new AuthError("Accès refusé pour ce rôle", 403);
  }
  return session;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
  role: Role;
}) {
  const email = input.email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError("Cet email est déjà utilisé", 409);
  }
  const passwordHash = await hashPassword(input.password);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      name: input.name.trim(),
      role: input.role,
      ...(input.role === "TALENT"
        ? { talentProfile: { create: {} } }
        : {}),
    },
  });
  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  await createSession(sessionUser);
  return sessionUser;
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AuthError("Email ou mot de passe incorrect", 401);
  }
  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  await createSession(sessionUser);
  return sessionUser;
}
