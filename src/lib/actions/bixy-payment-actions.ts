"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { calculateRefundCents, refundableBalanceCents, validateRefundPercentage } from "@/lib/bixy-refunds";

async function requireAdmin() { const user = await getSessionUser(); if (!user) throw new Error("Not authenticated"); if (user.role !== "ADMIN") throw new Error("Forbidden"); return user; }

export async function refundBixyPaymentAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const paymentIntentId = String(formData.get("paymentIntentId") ?? "");
  const percentage = validateRefundPercentage(formData.get("customPercentage") || formData.get("percentage"));
  const entitlement = await prisma.characterEntitlement.findFirst({ where: { userId, stripePaymentIntentId: paymentIntentId }, select: { userId: true, plan: true } });
  if (!entitlement) throw new Error("Bixy payment not found.");
  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
  const charge = typeof intent.latest_charge === "object" && intent.latest_charge ? intent.latest_charge : null;
  if (!charge || charge.payment_intent !== paymentIntentId) throw new Error("Stripe payment is not refundable.");
  const refunds = await stripe.refunds.list({ payment_intent: paymentIntentId, limit: 100 });
  const refundedCents = refunds.data.filter(refund => refund.status !== "failed" && refund.status !== "canceled").reduce((sum, refund) => sum + refund.amount, 0);
  const remainingCents = refundableBalanceCents(intent.amount_received || intent.amount, [refundedCents]);
  const calculated = calculateRefundCents(intent.amount_received || intent.amount, percentage);
  if (calculated.amountCents > remainingCents) throw new Error(`Refund exceeds remaining refundable balance of $${(remainingCents / 100).toFixed(2)}.`);
  const idempotencyKey = `bixy-refund:${paymentIntentId}:${percentage}:${remainingCents}`;
  try {
    const refund = await stripe.refunds.create({ payment_intent: paymentIntentId, amount: calculated.amountCents, metadata: { source: "sturdihome-bixy-admin", adminId: admin.id, refundPercentage: String(percentage) } }, { idempotencyKey });
    await prisma.bixyRefundAudit.create({ data: { adminId: admin.id, userId, paymentIntentId, stripeRefundId: refund.id, plan: entitlement.plan, originalAmountCents: intent.amount_received || intent.amount, refundPercentage: percentage, refundAmountCents: calculated.amountCents, remainingCents: remainingCents - calculated.amountCents, status: refund.status ?? "PENDING" } });
  } catch (error) {
    await prisma.bixyRefundAudit.create({ data: { adminId: admin.id, userId, paymentIntentId, plan: entitlement.plan, originalAmountCents: intent.amount_received || intent.amount, refundPercentage: percentage, refundAmountCents: calculated.amountCents, remainingCents, status: "FAILED", errorMessage: error instanceof Error ? error.message.slice(0, 500) : "Refund failed" } });
    throw error;
  }
  revalidatePath("/admin/bixy-payments");
}
