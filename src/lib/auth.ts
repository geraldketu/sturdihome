import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  signSessionToken,
  verifySessionToken,
} from "@/lib/jwt";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, role: string) {
  const token = await signSessionToken({ sub: userId, role: role as never });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      vendorProfile: true,
      financingProfile: true,
    },
  });

  return user;
}

export function loginDestinationForRole(role: string): string {
  switch (role) {
    case "HOMEOWNER":
      return "/member";
    case "VENDOR":
      return "/vendor";
    case "FINANCING_PARTNER":
      return "/financing";
    case "ADMIN":
      return "/admin";
    default:
      return "/";
  }
}
