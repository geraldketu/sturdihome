"use server";

import { revalidatePath } from "next/cache";
import { getApprovedUser, getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/auth-actions";
import { notifyUsers } from "@/lib/notifications";

async function requireVendorProject(id: string) {
  const user = await getApprovedUser();
  if (!user || user.role !== "VENDOR" || user.vendorProfile?.status !== "APPROVED") return null;
  const request = await prisma.serviceRequest.findFirst({ where: { id, assignedVendorId: user.vendorProfile.id }, include: { homeowner: true } });
  return request ? { user, request } : null;
}

export async function completeSiteVisitAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("requestId") ?? "");
  const context = await requireVendorProject(id);
  if (!context) return { error: "Not authorized." };
  await prisma.$transaction([prisma.serviceRequest.update({ where: { id }, data: { workflowStatus: "SITE_VISIT_COMPLETED", siteVisitCompletedAt: new Date() } }), prisma.serviceRequestAudit.create({ data: { serviceRequestId: id, actorUserId: context.user.id, previousStatus: context.request.workflowStatus, newStatus: "SITE_VISIT_COMPLETED" } })]);
  await notifyUsers([context.request.homeownerId], "Site visit completed", "Your vendor completed the site visit and can now prepare the final itemized quote.");
  revalidatePath("/vendor/leads"); revalidatePath("/member");
}

export async function createChangeOrderAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("requestId") ?? "");
  const context = await requireVendorProject(id);
  if (!context) return { error: "Not authorized." };
  const requestedAmountCents = Number(formData.get("requestedAmountCents"));
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 1000);
  if (!Number.isInteger(requestedAmountCents) || requestedAmountCents < 0 || !reason) return { error: "Enter a valid amount and reason." };
  const change = await prisma.changeOrder.create({ data: { serviceRequestId: id, originalAmountCents: context.request.finalQuoteTotalCents ?? 0, requestedAmountCents, reason } });
  await prisma.serviceRequest.update({ where: { id }, data: { workflowStatus: "CHANGE_ORDER_PENDING" } });
  await notifyUsers([context.request.homeownerId], "Change order requires review", "Your vendor submitted a project change. Review the updated amount and reason in My Projects.");
  revalidatePath("/vendor/leads"); revalidatePath("/member");
  void change;
}

export async function lenderDecisionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getApprovedUser();
  if (!user || user.role !== "FINANCING_PARTNER" || user.financingProfile?.status !== "APPROVED" || user.financingProfile.paymentStatus !== "PAID") return { error: "Not authorized." };
  const id = String(formData.get("financingRequestId") ?? "");
  const status = String(formData.get("lenderStatus") ?? "");
  if (!["UNDER_REVIEW", "ADDITIONAL_INFORMATION_NEEDED", "APPROVED", "DECLINED"].includes(status)) return { error: "Invalid lender status." };
  const financing = await prisma.financingRequest.findFirst({ where: { id, assignedPartnerId: user.financingProfile.id }, include: { serviceRequest: true } });
  if (!financing) return { error: "Financing request not found." };
  const projectStatus = status === "APPROVED" ? "FINANCING_APPROVED" : status === "DECLINED" ? "FINANCING_DECLINED" : status === "ADDITIONAL_INFORMATION_NEEDED" ? "ADDITIONAL_INFORMATION_NEEDED" : "LENDER_REVIEWING";
  await prisma.$transaction([prisma.financingRequest.update({ where: { id }, data: { lenderStatus: status } }), ...(financing.serviceRequest ? [prisma.serviceRequest.update({ where: { id: financing.serviceRequest.id }, data: { workflowStatus: projectStatus } }), prisma.serviceRequestAudit.create({ data: { serviceRequestId: financing.serviceRequest.id, actorUserId: user.id, previousStatus: financing.serviceRequest.workflowStatus, newStatus: projectStatus } })] : [])]);
  await notifyUsers([financing.homeownerId], "Financing status updated", `Your financing partner marked the project ${status.replaceAll("_", " ").toLowerCase()}.`);
  revalidatePath("/financing/referrals"); revalidatePath("/member");
}

export async function adminCompleteProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return { error: "Not authorized." };
  const id = String(formData.get("requestId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  if (!reason) return { error: "An override reason is required." };
  const request = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!request) return { error: "Project not found." };
  await prisma.$transaction([prisma.serviceRequest.update({ where: { id }, data: { status: "COMPLETED", workflowStatus: "COMPLETED", completedAt: new Date(), completedBy: user.id } }), prisma.serviceRequestAudit.create({ data: { serviceRequestId: id, actorUserId: user.id, previousStatus: request.workflowStatus, newStatus: "COMPLETED", note: `Admin override: ${reason}` } })]);
  revalidatePath("/admin/projects"); revalidatePath("/member"); revalidatePath("/vendor/leads");
}
