"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BIXY_ADMIN_SCHEMA, DEFAULT_BIXY_SETTINGS, getBixySettings } from "@/lib/bixy-settings";

async function requireAdmin() { const user = await getSessionUser(); if (!user || user.role !== "ADMIN") throw new Error("Not authorized"); return user; }
const bool = (form: FormData, name: string) => form.get(name) === "on";
const text = (form: FormData, name: string, fallback: string) => String(form.get(name) ?? fallback).trim().slice(0, 4000);

export async function saveBixySettingsAction(form: FormData): Promise<void> {
  const admin = await requireAdmin();
  const pages = text(form, "showOnPages", "*").split(/[,\n]/).map(value => value.trim()).filter(Boolean).slice(0, 50);
  const pricing = DEFAULT_BIXY_SETTINGS.pricingJson.map((plan, index) => ({ ...plan, amountCents: Math.max(0, Number(form.get(`price_${index}`) ?? plan.amountCents) || plan.amountCents), enabled: form.get(`plan_${index}`) === "on" }));
  const parsed = BIXY_ADMIN_SCHEMA.safeParse({ enabled: bool(form, "enabled"), showOnPages: pages, maintenanceMode: bool(form, "maintenanceMode"), maintenanceMessage: text(form, "maintenanceMessage", DEFAULT_BIXY_SETTINGS.maintenanceMessage), voiceOutputEnabled: bool(form, "voiceOutputEnabled"), voiceInputEnabled: bool(form, "voiceInputEnabled"), typedChatEnabled: bool(form, "typedChatEnabled"), animationMode: text(form, "animationMode", "basic"), mouthAnimationEnabled: bool(form, "mouthAnimationEnabled"), guidanceEnabled: bool(form, "guidanceEnabled"), pageHelpEnabled: bool(form, "pageHelpEnabled"), sessionPersistence: bool(form, "sessionPersistence"), freePreviewSeconds: Math.max(0, Math.min(3600, Number(form.get("freePreviewSeconds") ?? 60) || 60)), paidAccessEnabled: bool(form, "paidAccessEnabled"), pricingJson: pricing, greeting: text(form, "greeting", DEFAULT_BIXY_SETTINGS.greeting), fallbackMessage: text(form, "fallbackMessage", DEFAULT_BIXY_SETTINGS.fallbackMessage), personalityText: text(form, "personalityText", DEFAULT_BIXY_SETTINGS.personalityText), allowedDestinations: DEFAULT_BIXY_SETTINGS.allowedDestinations });
  if (!parsed.success) throw new Error("Invalid Bixy settings");
  const before = await getBixySettings();
  const after = { ...parsed.data, id: "default", allowedDestinations: [...parsed.data.allowedDestinations] };
  const changedKeys = Object.keys(after).filter(key => JSON.stringify((before as Record<string, unknown>)[key]) !== JSON.stringify((after as Record<string, unknown>)[key]));
  await prisma.$transaction([prisma.bixySettings.upsert({ where: { id: "default" }, update: parsed.data, create: after }), prisma.bixyConfigAudit.create({ data: { settingsId: "default", adminId: admin.id, changedKeys, beforeJson: before, afterJson: after } })]);
  revalidatePath("/", "layout"); revalidatePath("/admin/bixy");
}

export async function restoreBixyDefaultsAction(): Promise<void> {
  const admin = await requireAdmin();
  const before = await getBixySettings();
  const { id: _id, ...defaults } = DEFAULT_BIXY_SETTINGS;
  void _id;
  await prisma.$transaction([prisma.bixySettings.upsert({ where: { id: "default" }, update: defaults, create: DEFAULT_BIXY_SETTINGS }), prisma.bixyConfigAudit.create({ data: { settingsId: "default", adminId: admin.id, changedKeys: Object.keys(DEFAULT_BIXY_SETTINGS), beforeJson: before, afterJson: DEFAULT_BIXY_SETTINGS } })]);
  revalidatePath("/", "layout"); revalidatePath("/admin/bixy");
}