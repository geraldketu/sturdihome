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

async function adminProjectAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return { error: "Not authorized." };
  const id = String(formData.get("requestId") ?? "");
  const request = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!request) return { error: "Project not found." };
  return { user, request };
}

export async function updateProjectAdminAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const context = await adminProjectAction(formData);
  if ("error" in context) return context;
  const serviceType = String(formData.get("serviceType") ?? "").trim().slice(0, 120);
  const description = String(formData.get("description") ?? "").trim().slice(0, 10000);
  const adminNote = String(formData.get("adminNote") ?? "").trim().slice(0, 1000) || null;
  if (!serviceType || !description) return { error: "Project type and description are required." };
  await prisma.serviceRequest.update({ where: { id: context.request.id }, data: { serviceType, description, adminNote, adminUpdatedAt: new Date(), adminUpdatedBy: context.user.id } });
  revalidatePath("/admin/projects");
}

export async function suspendProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return setAdminProjectStatus(formData, "SUSPENDED", "Project suspended by admin");
}

export async function cancelProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return setAdminProjectStatus(formData, "CANCELED", "Project canceled by admin");
}

export async function overrideProjectStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const status = String(formData.get("status") ?? "").trim();
  if (!["NEW", "ASSIGNED", "IN_PROGRESS", "SITE_VISIT_COMPLETED", "ESTIMATE_SUBMITTED"].includes(status)) return { error: "Choose an active project status." };
  return setAdminProjectStatus(formData, status, String(formData.get("reason") ?? "Admin status override").trim().slice(0, 500));
}

async function setAdminProjectStatus(formData: FormData, status: string, note: string): Promise<ActionState> {
  const context = await adminProjectAction(formData);
  if ("error" in context) return context;
  await prisma.$transaction([
    prisma.serviceRequest.update({ where: { id: context.request.id }, data: { status: status === "CANCELED" ? "CANCELED" : status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS", workflowStatus: status, completedAt: status === "COMPLETED" ? new Date() : null, completedBy: status === "COMPLETED" ? context.user.id : null, adminUpdatedAt: new Date(), adminUpdatedBy: context.user.id } }),
    prisma.serviceRequestAudit.create({ data: { serviceRequestId: context.request.id, actorUserId: context.user.id, previousStatus: context.request.workflowStatus, newStatus: status, note } }),
  ]);
  revalidatePath("/admin/projects"); revalidatePath("/member"); revalidatePath("/vendor/leads");
}

export async function transferProjectAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const context = await adminProjectAction(formData);
  if ("error" in context) return context;
  const vendorId = String(formData.get("vendorId") ?? "");
  const vendor = await prisma.vendorProfile.findFirst({ where: { id: vendorId, status: "APPROVED", membershipStatus: "ACTIVE", user: { accountStatus: "ACTIVE" } } });
  if (!vendor) return { error: "Choose an approved vendor." };
  await prisma.$transaction([
    prisma.serviceRequest.update({ where: { id: context.request.id }, data: { assignedVendorId: vendor.id, status: "ASSIGNED", workflowStatus: "ASSIGNED", adminUpdatedAt: new Date(), adminUpdatedBy: context.user.id } }),
    prisma.serviceRequestAudit.create({ data: { serviceRequestId: context.request.id, actorUserId: context.user.id, previousStatus: context.request.workflowStatus, newStatus: "ASSIGNED", note: "Project transferred to another vendor" } }),
  ]);
  revalidatePath("/admin/projects"); revalidatePath("/vendor/leads");
}

export async function reportVendorComplaintAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);
  if (!reason) return { error: "Enter a complaint note." };
  const context = await adminProjectAction(formData);
  if ("error" in context) return context;
  await prisma.serviceRequestAudit.create({ data: { serviceRequestId: context.request.id, actorUserId: context.user.id, previousStatus: context.request.workflowStatus, newStatus: context.request.workflowStatus, note: `Vendor complaint: ${reason}` } });
  revalidatePath("/admin/projects");
}
