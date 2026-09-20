"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { accountGate } from "@/lib/approval";
import { prisma } from "@/lib/prisma";

export async function createVendorReferralAction() {
  const user = await getSessionUser();
  if (!user || user.role !== "VENDOR" || await accountGate(user)) redirect("/pending-approval");
  await prisma.vendorReferral.create({ data: { vendorUserId: user.id, code: randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase() } });
  revalidatePath("/vendor/referrals");
}