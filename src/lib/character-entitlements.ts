import "server-only";
import { prisma } from "@/lib/prisma";
import { CHARACTER_FREE_SECONDS, CHARACTER_INTERACTION_SECONDS, CHARACTER_PLANS } from "@/lib/character-config";
import { getBixySettings } from "@/lib/bixy-settings";

export async function getCharacterStatus(userId: string) {
  const settings = await getBixySettings();
  const freeSeconds = settings.freePreviewSeconds ?? CHARACTER_FREE_SECONDS;
  const entitlement = await prisma.characterEntitlement.upsert({ where: { userId }, update: {}, create: { userId, freeSecondsRemaining: freeSeconds } });
  const expired = entitlement.expiresAt !== null && entitlement.expiresAt <= new Date();
  const paidSecondsRemaining = expired ? 0 : entitlement.paidSecondsRemaining;
  if (expired && entitlement.status === "PAID") await prisma.characterEntitlement.update({ where: { id: entitlement.id }, data: { paidSecondsRemaining: 0, status: "EXPIRED" } });
  return { freeSecondsRemaining: entitlement.freeSecondsRemaining, paidSecondsRemaining, plan: expired ? null : entitlement.plan, expiresAt: expired ? null : entitlement.expiresAt, status: expired ? "EXPIRED" : entitlement.status, hasAccess: entitlement.freeSecondsRemaining > 0 || paidSecondsRemaining > 0 };
}

export async function consumeCharacterAccess(userId: string, character: "brixy") {
  const settings = await getBixySettings();
  const freeSeconds = settings.freePreviewSeconds ?? CHARACTER_FREE_SECONDS;
  return prisma.$transaction(async (tx) => {
    const entitlement = await tx.characterEntitlement.upsert({ where: { userId }, update: {}, create: { userId, freeSecondsRemaining: freeSeconds } });
    const now = new Date();
    const paidActive = entitlement.paidSecondsRemaining > 0 && (!entitlement.expiresAt || entitlement.expiresAt > now);
    const useFree = entitlement.freeSecondsRemaining >= CHARACTER_INTERACTION_SECONDS;
    if (!useFree && !paidActive) return { allowed: false as const, reason: "PURCHASE_REQUIRED" as const };
    const updated = await tx.characterEntitlement.update({ where: { id: entitlement.id }, data: useFree ? { freeSecondsRemaining: { decrement: CHARACTER_INTERACTION_SECONDS } } : { paidSecondsRemaining: { decrement: CHARACTER_INTERACTION_SECONDS }, status: "PAID" } });
    await tx.characterUsage.create({ data: { userId, character, seconds: CHARACTER_INTERACTION_SECONDS, source: useFree ? "FREE" : "PAID" } });
    return { allowed: true as const, source: useFree ? "FREE" as const : "PAID" as const, freeSecondsRemaining: updated.freeSecondsRemaining, paidSecondsRemaining: updated.paidSecondsRemaining };
  }, { isolationLevel: "Serializable" });
}

export function characterPlan(id: string) { return Object.values(CHARACTER_PLANS).find((plan) => plan.id === id) ?? null; }

export async function grantCharacterPlan(userId: string, planId: string, checkoutSessionId: string, paymentIntentId: string | null) {
  const plan = characterPlan(planId);
  if (!plan) throw new Error("Unknown character plan");
  const existing = await prisma.characterEntitlement.findUnique({ where: { stripeCheckoutSessionId: checkoutSessionId } });
  if (existing) return existing;
  const purchasedAt = new Date();
  const expiresAt = plan.days ? new Date(purchasedAt.getTime() + plan.days * 24 * 60 * 60 * 1000) : null;
  return prisma.characterEntitlement.upsert({
    where: { userId },
    update: { paidSecondsRemaining: { increment: plan.seconds }, plan: plan.id, purchasedAt, expiresAt, status: "PAID", stripeCheckoutSessionId: checkoutSessionId, stripePaymentIntentId: paymentIntentId },
    create: { userId, freeSecondsRemaining: CHARACTER_FREE_SECONDS, paidSecondsRemaining: plan.seconds, plan: plan.id, purchasedAt, expiresAt, status: "PAID", stripeCheckoutSessionId: checkoutSessionId, stripePaymentIntentId: paymentIntentId },
  });
}
