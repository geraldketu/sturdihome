"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/auth-actions";

const ALLOWED_STATUSES = ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELED"] as const;

export async function updateLeadStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || (user.role !== "VENDOR" && user.role !== "ADMIN") || !user.vendorProfile) {
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

export async function setServiceRequestPriceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || (user.role !== "VENDOR" && user.role !== "ADMIN") || !user.vendorProfile) {
    return { error: "Not authorized" };
  }

  const requestId = String(formData.get("requestId") ?? "");
  const priceDollars = Number(formData.get("priceDollars"));
  if (!Number.isFinite(priceDollars) || priceDollars <= 0) {
    return { error: "Enter a valid price" };
  }

  const request = await prisma.serviceRequest.findFirst({
    where: { id: requestId, assignedVendorId: user.vendorProfile.id },
  });
  if (!request) {
    return { error: "Lead not found" };
  }

  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { priceCents: Math.round(priceDollars * 100), paymentStatus: "UNPAID" },
  });

  revalidatePath("/vendor/leads");
  revalidatePath("/member/service-request");
}
