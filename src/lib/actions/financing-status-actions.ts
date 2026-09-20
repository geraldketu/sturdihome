"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/auth-actions";

const ALLOWED_STATUSES = new Set(["CURRENT", "PAYMENT_ISSUE", "DELINQUENCY", "RESOLVED", "CLOSED", "SUBMITTED_IN_ERROR"]);

async function requireApprovedPartner() {
  const user = await getSessionUser();
  if (!user || user.role !== "FINANCING_PARTNER" || user.accountStatus === "CANCELLED" || user.accountStatus === "REVOKED" || user.financingProfile?.status !== "APPROVED") throw new Error("Not authorized");
  return user;
}

export async function submitFinancingStatusAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireApprovedPartner();
  const financingRequestId = String(formData.get("financingRequestId") ?? "");
  const status = String(formData.get("status") ?? "");
  const relationshipReference = String(formData.get("relationshipReference") ?? "").trim().slice(0, 160) || null;
  if (!ALLOWED_STATUSES.has(status)) return { error: "Choose a valid account status." };
  const confirmations = ["authorizationConfirmed", "accuracyConfirmed", "ownRelationshipConfirmed", "noCollectionConfirmed", "updateCommitmentConfirmed"];
  if (confirmations.some((name) => formData.get(name) !== "yes")) return { error: "All reporting confirmations are required." };
  const relationship = await prisma.financingRequest.findFirst({ where: { id: financingRequestId, assignedPartner: { userId: user.id } }, select: { id: true, homeownerId: true, assignedPartnerId: true } });
  if (!relationship || !user.financingProfile || relationship.assignedPartnerId !== user.financingProfile.id) return { error: "You may report only financing relationships managed by your company." };
  await prisma.$transaction(async (tx) => {
    await tx.financingStatusReport.updateMany({ where: { financingRequestId: relationship.id, active: true }, data: { active: false, resolvedAt: new Date() } });
    const created = await tx.financingStatusReport.create({ data: { financePartnerUserId: user.id, financePartnerProfileId: user.financingProfile!.id, memberId: relationship.homeownerId, financingRequestId: relationship.id, status, relationshipReference, authorizationConfirmed: true, accuracyConfirmed: true, ownRelationshipConfirmed: true, noCollectionConfirmed: true, updateCommitmentConfirmed: true } });
    await tx.financingStatusAudit.create({ data: { reportId: created.id, actorUserId: user.id, action: "SUBMITTED", reason: status } });
    if (status === "PAYMENT_ISSUE" || status === "DELINQUENCY") {
      await tx.user.update({ where: { id: relationship.homeownerId }, data: { financingAccessStatus: "REVIEW_REQUIRED" } });
      await tx.userNotification.create({ data: { userId: relationship.homeownerId, reportId: created.id, title: "Financing account status reported", body: `Your participating finance partner reported a ${status === "DELINQUENCY" ? "delinquency" : "payment issue"}. SturdiHome has not independently determined the validity or amount of any debt. Contact the reporting finance partner about the underlying account, or use the dispute option in your member account.` } });
    }
  });
  revalidatePath("/financing/status-reporting");
  revalidatePath("/member");
  revalidatePath("/member/financing-request");
  return {};
}

export async function submitFinancingDisputeAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || user.role !== "HOMEOWNER" || user.accountStatus === "CANCELLED") return { error: "Not authorized." };
  const reportId = String(formData.get("reportId") ?? "");
  const response = String(formData.get("response") ?? "").trim().slice(0, 4000);
  if (!response) return { error: "Explain the error or response." };
  const report = await prisma.financingStatusReport.findFirst({ where: { id: reportId, memberId: user.id, active: true }, select: { id: true } });
  if (!report) return { error: "Report not found." };
  await prisma.$transaction(async (tx) => {
    await tx.financingStatusDispute.create({ data: { reportId, memberId: user.id, response } });
    await tx.financingStatusAudit.create({ data: { reportId, actorUserId: user.id, action: "DISPUTE_SUBMITTED", reason: response.slice(0, 500) } });
  });
  revalidatePath("/member/account-status");
  revalidatePath("/admin/financing-status");
  return {};
}
