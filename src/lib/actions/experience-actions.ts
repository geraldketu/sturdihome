"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPreviewTheme } from "@/lib/seasonal-theme";
import { randomUUID } from "node:crypto";
import { deleteSeasonalBlob, putSeasonalBlob } from "@/lib/seasonal-blob-storage";
import { UploadValidationError, validateSeasonalEffect } from "@/lib/upload-validation";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") throw new Error("Not authorized");
  return user;
}

export async function updateExperienceSettingsAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const previewTheme = getPreviewTheme(String(formData.get("previewTheme") ?? "automatic"));
  const current = await prisma.siteExperienceSettings.findUnique({ where: { id: "default" }, select: { activeTheme: true } });
  await prisma.siteExperienceSettings.upsert({
    where: { id: "default" },
    update: {
      weatherEnabled: formData.get("weatherEnabled") === "on",
      seasonalEnabled: formData.get("seasonalEnabled") === "on",
      holidayEnabled: formData.get("holidayEnabled") === "on",
      effectsDisabled: formData.get("effectsDisabled") === "on",
      previewTheme,
      activeTheme: current?.activeTheme ?? null,
    },
    create: {
      id: "default",
      weatherEnabled: formData.get("weatherEnabled") === "on",
      seasonalEnabled: formData.get("seasonalEnabled") === "on",
      holidayEnabled: formData.get("holidayEnabled") === "on",
      effectsDisabled: formData.get("effectsDisabled") === "on",
      previewTheme,
      activeTheme: null,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/experience");
}

export async function commitExperienceThemeAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const activeTheme = getPreviewTheme(String(formData.get("previewTheme") ?? "automatic"));
  await prisma.siteExperienceSettings.upsert({ where: { id: "default" }, update: { activeTheme, previewTheme: activeTheme }, create: { id: "default", activeTheme, previewTheme: activeTheme } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/experience");
}

export type SeasonalEffectState = { error?: string; success?: string } | undefined;

export async function uploadSeasonalEffectAction(_previous: SeasonalEffectState, formData: FormData): Promise<SeasonalEffectState> {
  const admin = await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Choose an image or video first." };
  try {
    const bytes = await validateSeasonalEffect(file);
    const fileName = `${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120)}`;
    const pathname = `seasonal/${admin.id}/${fileName}`;
    await putSeasonalBlob(pathname, bytes, file.type);
    await prisma.seasonalEffect.create({ data: { storageUserId: admin.id, fileName: pathname, originalName: file.name.slice(0, 180), mimeType: file.type, byteSize: bytes.length } });
    revalidatePath("/admin/experience");
    return { success: "Seasonal media uploaded." };
  } catch (error) {
    return { error: error instanceof UploadValidationError ? error.message : "The seasonal media could not be uploaded." };
  }
}

export async function activateSeasonalEffectAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("effectId") ?? "");
  const effect = await prisma.seasonalEffect.findFirst({ where: { id, deletedAt: null } });
  if (!effect) return;
  await prisma.$transaction([prisma.seasonalEffect.updateMany({ where: { deletedAt: null }, data: { active: false } }), prisma.seasonalEffect.update({ where: { id }, data: { active: true } })]);
  void admin;
  revalidatePath("/admin/experience"); revalidatePath("/", "layout");
}

export async function deactivateSeasonalEffectAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("effectId") ?? "");
  await prisma.seasonalEffect.updateMany({ where: { id }, data: { active: false } });
  revalidatePath("/admin/experience"); revalidatePath("/", "layout");
}

export async function deleteSeasonalEffectAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("effectId") ?? "");
  const effect = await prisma.seasonalEffect.findUnique({ where: { id } });
  if (!effect) return;
  await prisma.seasonalEffect.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  try { await deleteSeasonalBlob(effect.fileName); } catch { /* Keep the database tombstone if storage cleanup is unavailable. */ }
  revalidatePath("/admin/experience"); revalidatePath("/", "layout");
}