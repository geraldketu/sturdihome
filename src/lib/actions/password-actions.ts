"use server";
import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { destroySession, hashPassword } from "@/lib/auth";
import { authRateLimited } from "@/lib/auth-throttle";
import { resetEmailConfigured, sendPasswordResetEmail } from "@/lib/reset-email";
import { passwordSchema } from "@/lib/password-policy";

export type PasswordState = { error?: string; success?: string } | undefined;
const genericSuccess = { success: "If an account matches that email, you will receive a password-reset link shortly." };

export async function requestPasswordReset(_previous: PasswordState, form: FormData): Promise<PasswordState> {
  const parsed = z.string().trim().toLowerCase().email().safeParse(form.get("email"));
  if (!parsed.success) return { error: "Enter a valid email address." };
  if (!resetEmailConfigured()) return { error: "Password-reset emails are temporarily unavailable. Please contact Felicia@sturdihomenetwork.com for help." };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (await authRateLimited("reset-ip", ip, 20) || await authRateLimited("reset-email", parsed.data, 3)) return genericSuccess;
  await prisma.passwordReset.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  const user = await prisma.user.findFirst({ where: { email: { equals: parsed.data, mode: "insensitive" } } });
  if (!user) return genericSuccess;
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await prisma.passwordReset.create({ data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
  try { await sendPasswordResetEmail(user.email, token); }
  catch {
    await prisma.passwordReset.deleteMany({ where: { tokenHash } });
    // Do not reveal account existence or log tokens/email contents.
    console.error("Password-reset delivery failed. Check email provider configuration.");
  }
  return genericSuccess;
}

export async function resetPassword(_previous: PasswordState, form: FormData): Promise<PasswordState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (await authRateLimited("reset-consume", ip, 30)) return { error: "Too many attempts. Please try again in 15 minutes." };
  const parsed = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password: passwordSchema, confirm: z.string() })
    .safeParse({ token: form.get("token"), password: form.get("password"), confirm: form.get("confirm") });
  if (!parsed.success) return { error: "Use a valid reset link and a password between 8 and 72 characters." };
  if (parsed.data.password !== parsed.data.confirm) return { error: "Passwords must match." };
  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await prisma.passwordReset.findUnique({ where: { tokenHash } });
  if (!record || record.expiresAt <= new Date()) return { error: "This reset link is invalid or expired. Request a new link." };
  const passwordHash = await hashPassword(parsed.data.password);
  const changed = await prisma.$transaction(async tx => {
    const consumed = await tx.passwordReset.deleteMany({ where: { tokenHash, expiresAt: { gt: new Date() } } });
    if (!consumed.count) return false;
    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await tx.passwordReset.deleteMany({ where: { userId: record.userId } });
    await tx.authSession.deleteMany({ where: { userId: record.userId } });
    return true;
  });
  if (!changed) return { error: "This reset link has already been used. Request a new link." };
  await destroySession();
  redirect("/login?reset=success");
}
