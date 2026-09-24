"use server";

import { approvedAccountWhere } from "@/lib/approval";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getApprovedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UploadValidationError } from "@/lib/upload-validation";
import { authRateLimited } from "@/lib/auth-throttle";
import { saveUpload } from "@/lib/uploads";
import { calculateEstimate } from "@/lib/estimator";
import type { ActionState } from "@/lib/actions/auth-actions";
import { hasMemberStandingAccess } from "@/lib/member-standing";
import { HOMEOWNERSHIP_DOCUMENT_LABELS, isHomeownerVerified, isHomeownershipDocumentType } from "@/lib/homeowner-access";

async function requireHomeowner() {
  const user = await getApprovedUser();
  if (!user || (user.role !== "HOMEOWNER" && user.role !== "ADMIN")) {
    throw new Error("Not authorized");
  }
  return user;
}

async function requireVerifiedHomeowner() {
  const user = await requireHomeowner();
  if (!isHomeownerVerified(user)) throw new Error("Homeownership verification required");
  return user;
}

export async function acceptAgreementAction(): Promise<void> {
  redirect("/agreement");
}

const documentSchema = z.object({
  label: z.string().trim().min(1, "Please label this document").max(160),
});

export async function uploadDocumentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireHomeowner();

  const documentType = formData.get("documentType");
  if (user.homeownerAccountType === "SERVICE_ONLY") return { error: "Service-only accounts do not require document uploads." };
  if (!isHomeownershipDocumentType(documentType)) return { error: "Choose one accepted proof of homeownership." };
  const parsed = documentSchema.safeParse({ label: HOMEOWNERSHIP_DOCUMENT_LABELS[documentType] });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." };
  }

  if (await authRateLimited("uploads", user.id, 20)) return { error: "Too many uploads. Please try again in 15 minutes." };
  const existingVerification = await prisma.document.findFirst({ where: { userId: user.id, documentType: { in: ["PROPERTY_TAX_BILL", "MORTGAGE_STATEMENT", "HOMEOWNERS_INSURANCE_DECLARATION_PAGE", "DEED"] } }, select: { id: true } });
  if (existingVerification) return { error: "Only one proof of homeownership is required. Your uploaded document is already saved in My Documents." };
  let storedName: string;
  try { storedName = await saveUpload(file, user.id); }
  catch (error) { return { error: error instanceof UploadValidationError ? error.message : "The file could not be saved. Please try again." }; }
  await prisma.document.create({
    data: { userId: user.id, label: parsed.data.label, documentType, fileName: storedName, reviewStatus: "PENDING_MANUAL_VERIFICATION" },
  });
  await prisma.user.update({ where: { id: user.id }, data: { homeownerVerificationStatus: "PENDING_MANUAL_VERIFICATION" } });
  await prisma.userNotification.create({ data: { userId: user.id, title: "Additional verification needed", body: "Your homeownership document was received and is pending manual verification by SturdiHome. You may redact account numbers or unrelated financial information." } });

  revalidatePath("/member/documents");
  revalidatePath("/member");
}

const financingRequestSchema = z.object({
  projectDescription: z.string().trim().min(1, "Please describe the project").max(10000),
  amountRequested: z.coerce.number().int().positive("Enter a valid amount").max(2147483647),
  partnerId: z.string().optional(),
});

export async function submitFinancingRequestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireVerifiedHomeowner();
  if (!(await hasMemberStandingAccess(user.id))) return { error: "Please review and accept the Member Account Standing and Platform Access Agreement first." };
  if (user.financingAccessStatus !== "ACTIVE") return { error: "New financing referrals are temporarily restricted while this account status is reviewed. Use the dispute option in Account Status." };
  if (await authRateLimited("member-requests", user.id, 30)) return { error: "Too many requests. Please try again in 15 minutes." };
  const parsed = financingRequestSchema.safeParse({
    projectDescription: formData.get("projectDescription"),
    amountRequested: formData.get("amountRequested"),
    partnerId: formData.get("partnerId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let assignedPartnerId: string | undefined;
  if (parsed.data.partnerId) {
    const partner = await prisma.financingPartnerProfile.findFirst({
      where: { id: parsed.data.partnerId, status: "APPROVED", paymentStatus: "PAID", user: await approvedAccountWhere("FINANCING_PARTNER") },
    });
    if (!partner) {
      return { error: "That financing partner is no longer available. Please pick another." };
    }
    assignedPartnerId = partner.id;
  }

  await prisma.financingRequest.create({
    data: {
      homeownerId: user.id,
      projectDescription: parsed.data.projectDescription,
      amountRequested: parsed.data.amountRequested,
      assignedPartnerId,
      status: assignedPartnerId ? "ASSIGNED" : "NEW",
    },
  });

  revalidatePath("/member/financing-request");
  revalidatePath("/member");
  if (assignedPartnerId) revalidatePath("/financing/referrals");
}

const serviceRequestSchema = z.object({
  serviceType: z.string().trim().min(1, "Select a service type").max(120),
  description: z.string().trim().min(1, "Please describe what you need").max(10000),
  scope: z.enum(["small", "standard", "large"]).default("standard"),
  urgency: z.enum(["standard", "urgent"]).default("standard"),
  squareFootage: z.preprocess(
    (v) => (v === null || v === "" ? undefined : v),
    z.coerce.number().int().positive().optional(),
  ),
  vendorId: z.string().optional(),
});

export async function submitServiceRequestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireHomeowner();
  if (await authRateLimited("member-requests", user.id, 30)) return { error: "Too many requests. Please try again in 15 minutes." };
  const parsed = serviceRequestSchema.safeParse({
    serviceType: formData.get("serviceType"),
    description: formData.get("description"),
    scope: formData.get("scope") || undefined,
    urgency: formData.get("urgency") || undefined,
    squareFootage: formData.get("squareFootage"),
    vendorId: formData.get("vendorId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let assignedVendorId: string | undefined;
  if (parsed.data.vendorId) {
    const vendor = await prisma.vendorProfile.findFirst({
      where: { id: parsed.data.vendorId, status: "APPROVED", membershipStatus: "ACTIVE", user: await approvedAccountWhere("VENDOR") },
    });
    if (!vendor) {
      return { error: "That vendor is no longer available. Please pick another." };
    }
    if (!vendor.servicesOffered.toLowerCase().includes(parsed.data.serviceType.toLowerCase())) {
      return { error: "That vendor doesn't list this service type. Please pick another." };
    }
    assignedVendorId = vendor.id;
  }

  // Estimate is always recomputed server-side from the submitted job details --
  // never trust a client-supplied price.
  const estimate = calculateEstimate({
    serviceType: parsed.data.serviceType,
    scope: parsed.data.scope,
    urgency: parsed.data.urgency,
    squareFootage: parsed.data.squareFootage,
  });

  await prisma.serviceRequest.create({
    data: {
      homeownerId: user.id,
      serviceType: parsed.data.serviceType,
      description: parsed.data.description,
      estimateLowCents: estimate.lowCents,
      estimateHighCents: estimate.highCents,
      assignedVendorId,
      status: assignedVendorId ? "ASSIGNED" : "NEW",
    },
  });

  revalidatePath("/member/service-request");
  revalidatePath("/member");
  if (assignedVendorId) revalidatePath("/vendor/leads");
}

export async function acceptFinalQuoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireHomeowner();
  const requestId = String(formData.get("requestId") ?? "");
  const request = await prisma.serviceRequest.findFirst({ where: { id: requestId, homeownerId: user.id, workflowStatus: "FINAL_QUOTE_SUBMITTED" }, include: { quoteItems: true, assignedVendor: true } });
  if (!request) return { error: "Final quote not found or no longer available." };
  const financing = await prisma.$transaction(async tx => {
    const next = await tx.serviceRequest.update({ where: { id: requestId }, data: { workflowStatus: "FINANCING_REQUESTED", quoteAcceptedAt: new Date(), quoteAcceptedBy: user.id } });
    const financingRequest = await tx.financingRequest.upsert({ where: { serviceRequestId: requestId }, update: { amountRequested: Math.ceil((request.finalQuoteTotalCents ?? 0) / 100), projectDescription: request.description, lenderStatus: "RECEIVED", financedLineItems: request.quoteItems }, create: { homeownerId: user.id, serviceRequestId: requestId, amountRequested: Math.ceil((request.finalQuoteTotalCents ?? 0) / 100), projectDescription: request.description, status: "NEW", lenderStatus: "RECEIVED", financedLineItems: request.quoteItems } });
    await tx.serviceRequestAudit.create({ data: { serviceRequestId: requestId, actorUserId: user.id, previousStatus: request.workflowStatus, newStatus: "FINANCING_REQUESTED" } });
    return { next, financingRequest };
  });
  if (request.assignedVendor?.userId) await prisma.userNotification.create({ data: { userId: request.assignedVendor.userId, title: "Homeowner accepted the final quote", body: "The project quote was accepted and is ready for the financing workflow." } });
  void financing;
  revalidatePath("/member");
}

export async function confirmServiceCompletionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireHomeowner();
  const requestId = String(formData.get("requestId") ?? "");
  const request = await prisma.serviceRequest.findFirst({ where: { id: requestId, homeownerId: user.id, workflowStatus: "AWAITING_HOMEOWNER_CONFIRMATION" }, select: { id: true, workflowStatus: true } });
  if (!request) return { error: "Completion confirmation is not available." };
  await prisma.$transaction([prisma.serviceRequest.update({ where: { id: requestId }, data: { status: "COMPLETED", workflowStatus: "COMPLETED", completedAt: new Date(), completedBy: user.id } }), prisma.serviceRequestAudit.create({ data: { serviceRequestId: requestId, actorUserId: user.id, previousStatus: request.workflowStatus, newStatus: "COMPLETED" } })]);
  revalidatePath("/member");
}

export async function approveChangeOrderAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireHomeowner();
  const id = String(formData.get("changeOrderId") ?? "");
  const change = await prisma.changeOrder.findFirst({ where: { id, serviceRequest: { homeownerId: user.id }, status: "PENDING_HOMEOWNER" } });
  if (!change) return { error: "Change order not found." };
  await prisma.$transaction([prisma.changeOrder.update({ where: { id }, data: { status: "APPROVED", approvedAt: new Date(), approvedBy: user.id } }), prisma.serviceRequest.update({ where: { id: change.serviceRequestId }, data: { workflowStatus: "HOMEOWNER_ACCEPTED" } })]);
  revalidatePath("/member");
}

const appointmentSchema = z.object({
  serviceRequestId: z.string().min(1, "Select a service request"),
  scheduledFor: z.string().min(1, "Choose a date and time"),
});

export async function bookAppointmentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireHomeowner();
  if (await authRateLimited("member-requests", user.id, 30)) return { error: "Too many requests. Please try again in 15 minutes." };
  const parsed = appointmentSchema.safeParse({
    serviceRequestId: formData.get("serviceRequestId"),
    scheduledFor: formData.get("scheduledFor"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const serviceRequest = await prisma.serviceRequest.findFirst({
    where: { id: parsed.data.serviceRequestId, homeownerId: user.id },
  });
  if (!serviceRequest) {
    return { error: "Service request not found." };
  }

  const scheduledFor = new Date(parsed.data.scheduledFor);
  if (Number.isNaN(scheduledFor.getTime())) {
    return { error: "Invalid date/time." };
  }
  if (scheduledFor <= new Date()) return { error: "Choose a future appointment time." };
  const existingAppointment = await prisma.appointment.findUnique({ where: { serviceRequestId: serviceRequest.id }, select: { id: true } });
  if (existingAppointment) return { error: "This service request already has an appointment. Use the existing appointment to update it." };

  await prisma.appointment.create({
    data: {
      homeownerId: user.id,
      serviceRequestId: serviceRequest.id,
      scheduledFor,
    },
  });

  revalidatePath("/member/appointments");
  revalidatePath("/member");
}
