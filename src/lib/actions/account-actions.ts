"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/auth-actions";
import { MEMBER_STANDING_CONTENT, MEMBER_STANDING_DOCUMENT_ID, MEMBER_STANDING_EFFECTIVE_DATE, MEMBER_STANDING_TITLE, MEMBER_STANDING_VERSION } from "@/lib/member-standing";
import { FINANCE_REPORTING_CONTENT, FINANCE_REPORTING_DOCUMENT_ID, FINANCE_REPORTING_VERSION } from "@/lib/finance-reporting-config";
import { syntheticQuery } from "@/lib/task4-test-db";

export async function cancelAccountAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || user.role === "ADMIN") return { error: "Sign in with an eligible network account." };
  if (formData.get("confirm") !== "yes") return { error: "Confirm that you want to cancel your account." };
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500) || null;
  await prisma.$transaction(async (tx) => {
    const current = await tx.user.findUnique({ where: { id: user.id } });
    if (!current || current.accountStatus === "CANCELLED") return;
    await tx.user.update({ where: { id: user.id }, data: { accountStatus: "CANCELLED", canceledAt: new Date(), cancellationReason: reason } });
    await tx.accountCancellationAudit.create({ data: { userId: user.id, actorUserId: user.id, reason } });
    await tx.authSession.deleteMany({ where: { userId: user.id } });
  });
  redirect("/account-cancelled");
}

export async function acceptMemberStandingAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || user.role !== "HOMEOWNER") return { error: "Only homeowner members can accept this agreement." };
  if (formData.get("accepted") !== "yes" || formData.get("electronicConsent") !== "yes") return { error: "Both electronic acceptance confirmations are required." };
  const fullLegalName = String(formData.get("fullLegalName") ?? "").trim();
  const signature = String(formData.get("electronicSignature") ?? "").trim();
  if (!fullLegalName || signature !== fullLegalName) return { error: "Type your full legal name and the same name as your electronic signature." };
  const signedAt = new Date();
  const signedCopy = `${MEMBER_STANDING_CONTENT}\n\nSIGNED ELECTRONICALLY\n\nSigned By: ${fullLegalName}\nDate: ${signedAt.toLocaleDateString()}\nTime: ${signedAt.toLocaleTimeString()}\nAgreement: ${MEMBER_STANDING_TITLE}\nVersion: ${MEMBER_STANDING_VERSION}`;
  await prisma.memberStandingAcceptance.upsert({ where: { userId_version: { userId: user.id, version: MEMBER_STANDING_VERSION } }, update: {}, create: { userId: user.id, version: MEMBER_STANDING_VERSION, effectiveDate: MEMBER_STANDING_EFFECTIVE_DATE, documentIdentifier: MEMBER_STANDING_DOCUMENT_ID, fullLegalName, electronicSignature: signature, signedCopyContent: signedCopy, acceptedAt: signedAt } });
  revalidatePath("/member/standing-agreement");
  revalidatePath("/member/documents");
  redirect("/member/financing-request");
}

export async function acceptFinanceReportingAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || user.role !== "FINANCING_PARTNER") return { error: "Only finance partners can accept this acknowledgment." };
  if (formData.get("accepted") !== "yes" || formData.get("electronicConsent") !== "yes") return { error: "Both confirmations are required." };
  const fullLegalName = String(formData.get("fullLegalName") ?? "").trim();
  const signature = String(formData.get("electronicSignature") ?? "").trim();
  if (!fullLegalName || signature !== fullLegalName) return { error: "Type your full legal name and the same name as your electronic signature." };
  const signedAt = new Date();
  const signedCopyContent = `${FINANCE_REPORTING_CONTENT}\n\nSIGNED ELECTRONICALLY\nSigned By: ${fullLegalName}\nDate: ${signedAt.toLocaleDateString()}\nTime: ${signedAt.toLocaleTimeString()}\nVersion: ${FINANCE_REPORTING_VERSION}`;
  if (process.env.SYNTHETIC_TEST_DB === "true" || process.env.DATABASE_URL?.includes("127.0.0.1:55439")) await syntheticQuery('INSERT INTO "FinancePartnerReportingAcceptance" ("id","userId","version","documentIdentifier","fullLegalName","electronicSignature","signedCopyContent","acceptedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT ("userId","version") DO NOTHING', [randomUUID(), user.id, FINANCE_REPORTING_VERSION, FINANCE_REPORTING_DOCUMENT_ID, fullLegalName, signature, signedCopyContent, signedAt.toISOString()]);
  else await prisma.financePartnerReportingAcceptance.upsert({ where: { userId_version: { userId: user.id, version: FINANCE_REPORTING_VERSION } }, update: {}, create: { userId: user.id, version: FINANCE_REPORTING_VERSION, documentIdentifier: FINANCE_REPORTING_DOCUMENT_ID, fullLegalName, electronicSignature: signature, signedCopyContent, acceptedAt: signedAt } });
  revalidatePath("/financing/status-reporting");
  redirect("/financing/status-reporting");
}