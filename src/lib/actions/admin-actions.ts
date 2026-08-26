"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/auth-actions";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
  return user;
}

export async function setVendorStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const vendorId = String(formData.get("vendorId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status !== "APPROVED" && status !== "REJECTED") return;

  await prisma.vendorProfile.update({
    where: { id: vendorId },
    data: { status, reviewedAt: new Date() },
  });
  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${vendorId}`);
}

export async function setFinancingPartnerStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const partnerId = String(formData.get("partnerId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status !== "APPROVED" && status !== "REJECTED") return;

  await prisma.financingPartnerProfile.update({
    where: { id: partnerId },
    data: { status, reviewedAt: new Date() },
  });
  revalidatePath("/admin/financing-partners");
  revalidatePath(`/admin/financing-partners/${partnerId}`);
}

export async function assignServiceRequestAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");
  const vendorId = String(formData.get("vendorId") ?? "");
  if (!requestId || !vendorId) return;

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

  await prisma.financingRequest.update({
    where: { id: requestId },
    data: { assignedPartnerId: partnerId, status: "ASSIGNED" },
  });
  revalidatePath("/admin/requests");
  revalidatePath("/financing/referrals");
  revalidatePath(`/admin/financing-partners/${partnerId}`);
}

export type AdminActionState = ActionState;
