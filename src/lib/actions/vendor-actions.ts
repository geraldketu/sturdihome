"use server";

import { revalidatePath } from "next/cache";
import { getApprovedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UploadValidationError } from "@/lib/upload-validation";
import { authRateLimited } from "@/lib/auth-throttle";
import { saveUpload } from "@/lib/uploads";
import type { ActionState } from "@/lib/actions/auth-actions";

const ALLOWED_STATUSES = ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELED"] as const;

async function requireAssignedVendor(requestId: string) {
  const user = await getApprovedUser();
  if (!user || user.role !== "VENDOR" || user.vendorProfile?.status !== "APPROVED" || user.vendorProfile.membershipStatus !== "ACTIVE" || !user.vendorProfile) return null;
  return prisma.serviceRequest.findFirst({ where: { id: requestId, assignedVendorId: user.vendorProfile.id } }).then(request => request ? { user, request } : null);
}

export async function respondToServiceRequestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const requestId = String(formData.get("requestId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const context = await requireAssignedVendor(requestId);
  if (!context || !["ACCEPT", "DECLINE"].includes(decision)) return { error: "Not authorized or invalid decision." };
  if (decision === "ACCEPT") {
    const activeJobs = await prisma.serviceRequest.count({ where: { assignedVendorId: context.user.vendorProfile!.id, workflowStatus: { in: ["VENDOR_ACCEPTED", "SITE_VISIT_SCHEDULED", "SITE_VISIT_COMPLETED", "FINAL_QUOTE_SUBMITTED", "HOMEOWNER_ACCEPTED", "FINANCING_REQUESTED", "LENDER_REVIEWING", "FINANCING_APPROVED", "JOB_AUTHORIZED", "WORK_IN_PROGRESS", "CHANGE_ORDER_PENDING", "AWAITING_HOMEOWNER_CONFIRMATION"] } } });
    if (activeJobs >= context.user.vendorProfile!.maxActiveJobs) return { error: "Your vendor account is currently at capacity." };
  }
  const nextStatus = decision === "ACCEPT" ? "VENDOR_ACCEPTED" : "VENDOR_DECLINED";
  await prisma.$transaction([prisma.serviceRequest.update({ where: { id: requestId }, data: { vendorResponse: decision, vendorResponseAt: new Date(), workflowStatus: nextStatus } }), prisma.serviceRequestAudit.create({ data: { serviceRequestId: requestId, actorUserId: context.user.id, previousStatus: context.request.workflowStatus, newStatus: nextStatus } })]);
  revalidatePath("/vendor/leads"); revalidatePath("/member");
}

export async function submitFinalQuoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const requestId = String(formData.get("requestId") ?? "");
  const context = await requireAssignedVendor(requestId);
  if (!context) return { error: "Not authorized." };
  const categories = formData.getAll("category").map(String);
  const descriptions = formData.getAll("description").map(String);
  const amounts = formData.getAll("amountCents").map(value => Number(value));
  if (!categories.length || categories.length !== descriptions.length || descriptions.length !== amounts.length || amounts.some(amount => !Number.isInteger(amount) || amount < 0)) return { error: "Enter at least one valid quote item." };
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  await prisma.$transaction(async tx => {
    await tx.quoteLineItem.deleteMany({ where: { serviceRequestId: requestId } });
    await tx.quoteLineItem.createMany({ data: categories.map((category, index) => ({ serviceRequestId: requestId, category: category.slice(0, 80), description: descriptions[index].slice(0, 500), amountCents: amounts[index] })) });
    await tx.serviceRequest.update({ where: { id: requestId }, data: { workflowStatus: "FINAL_QUOTE_SUBMITTED", finalQuoteSubmittedAt: new Date(), finalQuoteTotalCents: total } });
    await tx.serviceRequestAudit.create({ data: { serviceRequestId: requestId, actorUserId: context.user.id, previousStatus: context.request.workflowStatus, newStatus: "FINAL_QUOTE_SUBMITTED" } });
  });
  revalidatePath("/vendor/leads"); revalidatePath("/member");
}

export async function scheduleSiteVisitAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const requestId = String(formData.get("requestId") ?? "");
  const scheduledFor = new Date(String(formData.get("scheduledFor") ?? ""));
  const context = await requireAssignedVendor(requestId);
  if (!context || Number.isNaN(scheduledFor.getTime()) || scheduledFor <= new Date()) return { error: "Choose a future site-visit time." };
  await prisma.$transaction([prisma.appointment.upsert({ where: { serviceRequestId: requestId }, update: { scheduledFor, status: "SCHEDULED" }, create: { homeownerId: context.request.homeownerId, serviceRequestId: requestId, scheduledFor } }), prisma.serviceRequest.update({ where: { id: requestId }, data: { workflowStatus: "SITE_VISIT_SCHEDULED", siteVisitScheduledFor: scheduledFor } })]);
  revalidatePath("/vendor/leads"); revalidatePath("/member/appointments");
}

export async function markVendorCompleteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const requestId = String(formData.get("requestId") ?? "");
  const context = await requireAssignedVendor(requestId);
  if (!context || !["JOB_AUTHORIZED", "WORK_IN_PROGRESS", "HOMEOWNER_ACCEPTED", "FINANCING_APPROVED"].includes(context.request.workflowStatus)) return { error: "This job is not ready to be completed." };
  await prisma.$transaction([prisma.serviceRequest.update({ where: { id: requestId }, data: { workflowStatus: "AWAITING_HOMEOWNER_CONFIRMATION" } }), prisma.serviceRequestAudit.create({ data: { serviceRequestId: requestId, actorUserId: context.user.id, previousStatus: context.request.workflowStatus, newStatus: "AWAITING_HOMEOWNER_CONFIRMATION" } })]);
  revalidatePath("/vendor/leads"); revalidatePath("/member");
}

export async function updateLeadStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getApprovedUser();
  if (!user || user.vendorProfile?.status !== "APPROVED" || user.vendorProfile.membershipStatus !== "ACTIVE" || (user.role !== "VENDOR" && user.role !== "ADMIN")) {
    return { error: "Not authorized" };
  }

  const requestId = String(formData.get("requestId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!ALLOWED_STATUSES.includes(status as (typeof ALLOWED_STATUSES)[number])) {
    return { error: "Invalid status" };
  }

  const request = await prisma.serviceRequest.findFirst({
    where: { id: requestId, assignedVendorId: user.vendorProfile.id },
  });
  if (!request) {
    return { error: "Lead not found" };
  }

  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status: status as (typeof ALLOWED_STATUSES)[number] },
  });

  revalidatePath("/vendor/leads");
}

export async function uploadFlyerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getApprovedUser();
  if (!user || user.vendorProfile?.status !== "APPROVED" || user.role !== "VENDOR" || !user.vendorProfile) {
    return { error: "Not authorized" };
  }

  const label = String(formData.get("label") ?? "").trim();
  if (!label || label.length > 160) {
    return { error: "Please label this flyer" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." };
  }

  if (await authRateLimited("uploads", user.id, 20)) return { error: "Too many uploads. Please try again in 15 minutes." };
  let storedName: string;
  try { storedName = await saveUpload(file, user.id); }
  catch (error) { return { error: error instanceof UploadValidationError ? error.message : "The file could not be saved. Please try again." }; }
  await prisma.vendorFlyer.create({
    data: { vendorProfileId: user.vendorProfile.id, label, fileName: storedName },
  });

  revalidatePath("/vendor/flyers");
}
