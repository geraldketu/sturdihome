"use server";

import { approvedAccountWhere } from "@/lib/approval";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/auth-actions";
import { reviewAccount, revokeAccount } from "@/lib/admin-approval";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }

  return user;
}

export async function setVendorStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const vendorId = String(formData.get("vendorId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status !== "APPROVED" && status !== "REJECTED") return;

  const profile = await prisma.vendorProfile.findUnique({ where: { id: vendorId } });
  if (!profile || profile.status !== "PENDING") return;
  await reviewAccount(admin.id, profile.userId, "VENDOR", status);
  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${vendorId}`);
}

export async function setFinancingPartnerStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const partnerId = String(formData.get("partnerId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status !== "APPROVED" && status !== "REJECTED") return;

  const profile = await prisma.financingPartnerProfile.findUnique({ where: { id: partnerId } });
  if (!profile || profile.status !== "PENDING") return;
  await reviewAccount(admin.id, profile.userId, "FINANCING_PARTNER", status);
  revalidatePath("/admin/financing-partners");
  revalidatePath(`/admin/financing-partners/${partnerId}`);
}

export async function assignServiceRequestAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");
  const vendorId = String(formData.get("vendorId") ?? "");
  if (!requestId || !vendorId) return;
  if (!(await prisma.vendorProfile.findFirst({ where: { id: vendorId, status: "APPROVED", membershipStatus: "ACTIVE", user: await approvedAccountWhere("VENDOR") } }))) return;

  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { assignedVendorId: vendorId, status: "ASSIGNED" },
  });
  revalidatePath("/admin/requests");
  revalidatePath("/vendor/leads");
  revalidatePath(`/admin/vendors/${vendorId}`);
}

export async function assignFinancingRequestAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");
  const partnerId = String(formData.get("partnerId") ?? "");
  if (!requestId || !partnerId) return;
  if (!(await prisma.financingPartnerProfile.findFirst({ where: { id: partnerId, status: "APPROVED", paymentStatus: "PAID", user: await approvedAccountWhere("FINANCING_PARTNER") } }))) return;

  await prisma.financingRequest.update({
    where: { id: requestId },
    data: { assignedPartnerId: partnerId, status: "ASSIGNED" },
  });
  revalidatePath("/admin/requests");
  revalidatePath("/financing/referrals");
  revalidatePath(`/admin/financing-partners/${partnerId}`);
}

export async function setVendorFlyerStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const flyerId = String(formData.get("flyerId") ?? "");
  const vendorId = String(formData.get("vendorId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status !== "APPROVED" && status !== "REJECTED") return;

  await prisma.vendorFlyer.update({
    where: { id: flyerId },
    data: { status, reviewedAt: new Date() },
  });
  revalidatePath(`/admin/vendors/${vendorId}`);
  revalidatePath("/vendor/flyers");
}

export type AdminActionState = ActionState;

async function reviewUserAccount(form: FormData, status: "APPROVED" | "REJECTED") {
  const admin = await requireAdmin();
  const userId = String(form.get("userId") ?? "");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "ADMIN" || user.approvalStatus !== "PENDING") return;
  await reviewAccount(admin.id, userId, user.role, status);
  revalidatePath("/admin", "layout");
}

export async function approveAccountAction(form: FormData): Promise<void> {
  await reviewUserAccount(form, "APPROVED");
}

export async function rejectAccountAction(form: FormData): Promise<void> {
  await reviewUserAccount(form, "REJECTED");
}

export async function revokeAccessAction(form: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = String(form.get("userId") ?? "");
  if (!userId) return;
  await revokeAccount(admin.id, userId);
  revalidatePath("/admin", "layout");
}

export async function activateAgreementAction(form: FormData): Promise<void> {
  await requireAdmin();
  const agreementId = String(form.get("agreementId") ?? "");
  const agreement = await prisma.networkAgreement.findUnique({ where: { id: agreementId } });
  if (!agreement) return;
  await prisma.$transaction([
    prisma.networkAgreement.updateMany({ where: { role: agreement.role }, data: { active: false } }),
    prisma.networkAgreement.update({ where: { id: agreement.id }, data: { active: true } }),
  ]);
  revalidatePath("/admin/agreements");
  revalidatePath("/agreement");
}

export async function reviewFinancingStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const reportId = String(formData.get("reportId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500) || null;
  const report = await prisma.financingStatusReport.findUnique({ where: { id: reportId } });
  if (!report || !["KEEP_RESTRICTION", "RESTORE_ACCESS", "MARK_ERROR", "RESOLVE"].includes(decision)) return;
  await prisma.$transaction(async tx => {
    const restricted = decision === "KEEP_RESTRICTION";
    await tx.financingStatusReport.update({ where: { id: report.id }, data: { active: decision !== "MARK_ERROR", resolvedAt: decision === "RESOLVE" || decision === "MARK_ERROR" ? new Date() : null } });
    await tx.user.update({ where: { id: report.memberId }, data: { financingAccessStatus: restricted ? "FINANCING_ACCESS_RESTRICTED" : "ACTIVE" } });
    await tx.financingStatusAudit.create({ data: { reportId: report.id, actorUserId: admin.id, action: decision, reason } });
    await tx.userNotification.create({ data: { userId: report.memberId, reportId: report.id, title: decision === "RESTORE_ACCESS" ? "Financing referral access restored" : "Financing status review updated", body: decision === "MARK_ERROR" ? "The reported status was marked submitted in error. New SturdiHome financing referrals are available again." : decision === "KEEP_RESTRICTION" ? "SturdiHome is keeping a temporary financing referral restriction while the report is reviewed. This is not an independent debt determination." : "SturdiHome updated the review of the reported financing status." } });
  });
  revalidatePath("/admin/financing-status");
  revalidatePath("/member/account-status");
  revalidatePath("/member/financing-request");
}
