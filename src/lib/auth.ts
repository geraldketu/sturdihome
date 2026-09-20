import "server-only";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { joinUrl, roleHome, routeRoles, safeReturnTo } from "@/lib/access";
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, signSessionToken, verifySessionToken, type Role } from "@/lib/jwt";
import { accountGate } from "@/lib/approval";
import { isHomeownerVerified } from "@/lib/homeowner-access";

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);
export const loginDestinationForRole = roleHome;

export async function createSession(userId: string, role: string, next?: unknown) {
  const store = await cookies();
  const oldToken = store.get(SESSION_COOKIE)?.value;
  const old = oldToken ? await verifySessionToken(oldToken) : null;
  await prisma.authSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  const session = await prisma.$transaction(async tx => {
    if (old) await tx.authSession.deleteMany({ where: { id: old.sid, userId: old.sub } });
    const first = await tx.user.updateMany({ where: { id: userId, firstLoginAt: null }, data: { firstLoginAt: new Date() } });
    return tx.authSession.create({ data: {
      userId, expiresAt: new Date(Date.now() + SESSION_COOKIE_OPTIONS.maxAge * 1000),
      firstLogin: first.count === 1, returnTo: safeReturnTo(next, role) ?? roleHome(role),
    } });
  });
  const token = await signSessionToken({ sub: userId, role: role as Role, sid: session.id });
  store.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  if (payload) await prisma.authSession.deleteMany({ where: { id: payload.sid, userId: payload.sub } });
  store.delete(SESSION_COOKIE);
}

export const getAuthenticatedSession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;
  if (!payload) return null;
  const session = await prisma.authSession.findUnique({ where: { id: payload.sid }, include: {
    user: { omit: { passwordHash: true }, include: { vendorProfile: true, financingProfile: true } },
  } });
  if (!session || session.userId !== payload.sub || session.user.role !== payload.role || session.expiresAt <= new Date()) return null;
  return session;
});

export async function getSessionUser() {
  return (await getAuthenticatedSession())?.user ?? null;
}

// Actions use the same live agreement + manual approval policy as pages/APIs.
export async function getApprovedUser() {
  const user = await getSessionUser();
  return user && !(await accountGate(user)) ? user : null;
}

export async function requirePageAccess(path: string) {
  const user = await getSessionUser();
  if (!user) redirect(joinUrl(path));
  const roles = routeRoles(path.split("?")[0]);
  if (roles && !roles.includes(user.role)) redirect(roleHome(user.role));
  const gate = await accountGate(user);
  if (gate) redirect(gate === "agreement" ? "/agreement" : gate === "cancelled" ? "/account-cancelled" : gate === "revoked" ? "/account-revoked" : "/pending-approval");
  if (path.startsWith("/marketplace")) {
    if ((user.role === "VENDOR" && user.vendorProfile?.status !== "APPROVED") ||
        (user.role === "FINANCING_PARTNER" && user.financingProfile?.status !== "APPROVED")) redirect("/pending-approval");
  }
  if ((path === "/member/financing-request" || path === "/member/standing-agreement" || path === "/account-status") && !isHomeownerVerified(user)) redirect("/member");
  if (path === "/vendor" || path.startsWith("/vendor/")) {
    if (user.role === "VENDOR" && user.vendorProfile?.status !== "APPROVED") redirect("/pending-approval");
  }
  if (path === "/financing" || path.startsWith("/financing/")) {
    if (user.role === "FINANCING_PARTNER" && user.financingProfile?.status !== "APPROVED") redirect("/pending-approval");
  }
  return user;
}
