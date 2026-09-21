"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPreviewTheme } from "@/lib/seasonal-theme";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") throw new Error("Not authorized");
  return user;
}

export async function updateExperienceSettingsAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const previewTheme = getPreviewTheme(String(formData.get("previewTheme") ?? "automatic"));
  await prisma.siteExperienceSettings.upsert({
    where: { id: "default" },
    update: {
      weatherEnabled: formData.get("weatherEnabled") === "on",
      seasonalEnabled: formData.get("seasonalEnabled") === "on",
      holidayEnabled: formData.get("holidayEnabled") === "on",
      effectsDisabled: formData.get("effectsDisabled") === "on",
      previewTheme,
    },
    create: {
      id: "default",
      weatherEnabled: formData.get("weatherEnabled") === "on",
      seasonalEnabled: formData.get("seasonalEnabled") === "on",
      holidayEnabled: formData.get("holidayEnabled") === "on",
      effectsDisabled: formData.get("effectsDisabled") === "on",
      previewTheme,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/experience");
}