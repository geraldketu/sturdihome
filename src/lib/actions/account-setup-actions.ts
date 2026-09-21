"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { authRateLimited } from "@/lib/auth-throttle";
import { passwordSchema } from "@/lib/password-policy";

export async function completeAccountSetupAction(_prev: { error?: string } | undefined, formData: FormData): Promise<{ error?: string } | undefined> {
  const parsed = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: passwordSchema, confirm: z.string() }).safeParse({ token: formData.get("token"), password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return { error: "Use a valid setup link and password." };
  if (parsed.data.password !== parsed.data.confirm) return { error: "Passwords must match." };
  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  if (await authRateLimited("account-setup", tokenHash, 10)) return { error: "Too many setup attempts. Request a new setup link later." };
  const record = await prisma.accountSetupToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!record || record.usedAt || record.expiresAt <= new Date() || !record.user.passwordSetupRequired || record.user.approvalStatus !== "APPROVED") return { error: "This setup link is invalid, expired, or already used." };
  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction(async tx => { const consumed = await tx.accountSetupToken.updateMany({ where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } }, data: { usedAt: new Date() } }); if (!consumed.count) throw new Error("Setup link already used"); await tx.user.update({ where: { id: record.userId }, data: { passwordHash, passwordSetupRequired: false } }); await tx.authSession.deleteMany({ where: { userId: record.userId } }); });
  await createSession(record.userId, record.user.role, undefined);
  redirect("/welcome");
}