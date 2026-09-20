"use server";
import { redirect, RedirectType } from "next/navigation";
import { getAuthenticatedSession } from "@/lib/auth";
import { roleHome, safeReturnTo } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { accountGate } from "@/lib/approval";

export async function acknowledgeWelcome() {
  const session = await getAuthenticatedSession();
  if (session) await prisma.authSession.updateMany({ where: { id: session.id, userId: session.userId }, data: { welcomePending: false } });
}

export async function finishWelcome() {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/login");
  await prisma.authSession.updateMany({ where: { id: session.id, userId: session.userId }, data: { welcomePending: false } });
  const user = session.user;
  const gate = await accountGate(user);
  if (gate) redirect(gate === "agreement" ? "/agreement" : gate === "cancelled" ? "/account-cancelled" : gate === "revoked" ? "/account-revoked" : "/pending-approval", RedirectType.replace);
  if ((user.role === "VENDOR" && user.vendorProfile?.status !== "APPROVED") ||
      (user.role === "FINANCING_PARTNER" && user.financingProfile?.status !== "APPROVED")) redirect("/pending-approval", RedirectType.replace);
  redirect(safeReturnTo(session.returnTo, user.role) ?? roleHome(user.role), RedirectType.replace);
}
