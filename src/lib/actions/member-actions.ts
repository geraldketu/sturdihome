"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/uploads";
import { calculateEstimate } from "@/lib/estimator";
import type { ActionState } from "@/lib/actions/auth-actions";

async function requireHomeowner() {
  const user = await getSessionUser();
  if (!user || (user.role !== "HOMEOWNER" && user.role !== "ADMIN")) {
    throw new Error("Not authorized");
  }
  return user;
}

export async function acceptAgreementAction(): Promise<void> {
  const user = await requireHomeowner();
  await prisma.user.update({
    where: { id: user.id },
    data: { agreementAcceptedAt: new Date() },
  });
  revalidatePath("/member");
  revalidatePath("/member/agreement");
}

const documentSchema = z.object({
  label: z.string().min(1, "Please label this document"),
});

export async function uploadDocumentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireHomeowner();

  const parsed = documentSchema.safeParse({ label: formData.get("label") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." };
  }

  const storedName = await saveUpload(file, user.id);
  await prisma.document.create({
    data: { userId: user.id, label: parsed.data.label, fileName: storedName },
  });

  revalidatePath("/member/documents");
}

const financingRequestSchema = z.object({
  projectDescription: z.string().min(1, "Please describe the project"),
  amountRequested: z.coerce.number().int().positive("Enter a valid amount"),
  partnerId: z.string().optional(),
});

export async function submitFinancingRequestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireHomeowner();
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
      where: { id: parsed.data.partnerId, status: "APPROVED", paymentStatus: "PAID" },
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
  serviceType: z.string().min(1, "Select a service type"),
  description: z.string().min(1, "Please describe what you need"),
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
      where: { id: parsed.data.vendorId, status: "APPROVED", membershipStatus: "ACTIVE" },
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

const appointmentSchema = z.object({
  serviceRequestId: z.string().min(1, "Select a service request"),
  scheduledFor: z.string().min(1, "Choose a date and time"),
});

export async function bookAppointmentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireHomeowner();
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
