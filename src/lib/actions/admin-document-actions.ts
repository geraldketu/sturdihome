"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/uploads";
import { UploadValidationError } from "@/lib/upload-validation";
import type { ActionState } from "@/lib/actions/auth-actions";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function reviewDocumentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized." };
  const id = String(formData.get("documentId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["APPROVED", "REJECTED", "REQUESTED_INFO"].includes(status)) return { error: "Invalid document decision." };
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document || document.deletedAt) return { error: "Document not found." };
  const note = String(formData.get("note") ?? "").trim().slice(0, 500) || null;
  await prisma.$transaction(async tx => {
    await tx.document.update({ where: { id }, data: { reviewStatus: status, reviewNote: note, reviewedAt: new Date(), reviewedBy: admin.id } });
    if (document.userId) {
      const verificationStatus = status === "APPROVED" ? "VERIFIED" : status === "REQUESTED_INFO" ? "ADDITIONAL_VERIFICATION_NEEDED" : "PENDING_MANUAL_VERIFICATION";
      await tx.user.update({ where: { id: document.userId }, data: { homeownerVerificationStatus: verificationStatus } });
      await tx.userNotification.create({ data: { userId: document.userId, title: status === "APPROVED" ? "Homeownership verified" : status === "REQUESTED_INFO" ? "Additional verification needed" : "Homeownership verification needs review", body: note ?? (status === "APPROVED" ? "Your homeownership document was approved by SturdiHome." : "SturdiHome needs additional information to complete your homeownership verification.") } });
    }
  });
  revalidatePath("/admin/documents");
}

export async function sendDocumentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized." };
  const id = String(formData.get("documentId") ?? "");
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document || document.deletedAt) return { error: "Document not found." };
  await prisma.document.update({ where: { id }, data: { sentAt: new Date() } });
  revalidatePath("/admin/documents");
}

export async function deleteDocumentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized." };
  const id = String(formData.get("documentId") ?? "");
  await prisma.document.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: admin.id, reviewStatus: "DELETED" } });
  revalidatePath("/admin/documents");
}

export async function uploadAdminDocumentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: "Not authorized." };
  const userId = String(formData.get("userId") ?? "");
  const label = String(formData.get("label") ?? "").trim().slice(0, 160);
  const documentType = String(formData.get("documentType") ?? "").trim().slice(0, 100) || null;
  const file = formData.get("file");
  const account = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!account || account.role === "ADMIN" || !label || !(file instanceof File) || file.size === 0) return { error: "Choose an account, label, and file." };
  try {
    const fileName = await saveUpload(file, userId);
    await prisma.document.create({ data: { userId, label, documentType, fileName, reviewStatus: "APPROVED", reviewedAt: new Date(), reviewedBy: admin.id } });
  } catch (error) {
    return { error: error instanceof UploadValidationError ? error.message : "The file could not be saved." };
  }
  revalidatePath("/admin/documents");
}

export async function uploadAdminDocument(formData: FormData): Promise<void> {
  await uploadAdminDocumentAction(undefined, formData);
}

export async function updateApplicationAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;
  const userId = String(formData.get("userId") ?? "");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role === "ADMIN") return;
  await prisma.user.update({ where: { id: userId }, data: { name: String(formData.get("name") ?? "").trim().slice(0, 160), phone: String(formData.get("phone") ?? "").trim().slice(0, 40) || null, approvalStatus: ["PENDING", "APPROVED", "REJECTED"].includes(String(formData.get("approvalStatus"))) ? String(formData.get("approvalStatus")) as "PENDING" | "APPROVED" | "REJECTED" : undefined } });
  revalidatePath("/admin/documents");
}

export async function removeFromPageAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;
  const userId = String(formData.get("userId") ?? "");
  const pageKey = String(formData.get("pageKey") ?? "");
  if (!userId || !["finance", "service", "vendor", "homeowner"].includes(pageKey)) return;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role === "ADMIN") return;
  await prisma.userPageVisibility.upsert({ where: { userId_pageKey: { userId, pageKey } }, update: { removedAt: new Date(), removedBy: admin.id }, create: { userId, pageKey, removedBy: admin.id } });
  revalidatePath("/admin/documents");
  revalidatePath("/marketplace/vendors");
  revalidatePath("/marketplace/financing");
}