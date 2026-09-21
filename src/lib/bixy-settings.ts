import "server-only";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export type BixyPricingPlan = { id: string; label: string; amountCents: number; enabled: boolean };
export type BixySettingsValue = { id: string; enabled: boolean; showOnPages: string[]; maintenanceMode: boolean; maintenanceMessage: string; voiceOutputEnabled: boolean; voiceInputEnabled: boolean; typedChatEnabled: boolean; animationMode: string; mouthAnimationEnabled: boolean; guidanceEnabled: boolean; pageHelpEnabled: boolean; sessionPersistence: boolean; freePreviewSeconds: number; paidAccessEnabled: boolean; pricingJson: BixyPricingPlan[]; greeting: string; fallbackMessage: string; personalityText: string; allowedDestinations: string[] };

export const BIXY_PAGES = ["*", "/", "/services", "/marketplace/vendors", "/marketplace/financing", "/member", "/member/service-request", "/member/financing-request", "/member/appointments", "/member/documents", "/vendor", "/vendor/leads", "/financing", "/financing/referrals", "/how-it-works", "/join-network"] as const;
export const BIXY_NAV_TARGETS = BIXY_PAGES.filter(page => page !== "*") as readonly string[];
export const BIXY_ANIMATION_MODES = ["off", "static", "basic"] as const;
export const BIXY_ADMIN_SCHEMA = z.object({
  enabled: z.boolean(), showOnPages: z.array(z.enum(BIXY_PAGES)).max(100), maintenanceMode: z.boolean(), maintenanceMessage: z.string().trim().max(1000),
  voiceOutputEnabled: z.boolean(), voiceInputEnabled: z.boolean(), typedChatEnabled: z.boolean(), animationMode: z.enum(BIXY_ANIMATION_MODES), mouthAnimationEnabled: z.boolean(), guidanceEnabled: z.boolean(), pageHelpEnabled: z.boolean(), sessionPersistence: z.boolean(), freePreviewSeconds: z.number().int().min(0).max(3600), paidAccessEnabled: z.boolean(),
  pricingJson: z.array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/).max(80), label: z.string().trim().min(1).max(120), amountCents: z.number().int().min(0).max(100000), enabled: z.boolean() }).strict()).max(20), greeting: z.string().trim().max(500), fallbackMessage: z.string().trim().max(1000), personalityText: z.string().trim().max(10000), allowedDestinations: z.array(z.string().refine(value => BIXY_NAV_TARGETS.includes(value), "Unapproved navigation target")).max(100),
}).strict();

export const DEFAULT_BIXY_SETTINGS: BixySettingsValue = {
  id: "default", enabled: true, showOnPages: ["*"], maintenanceMode: false,
  maintenanceMessage: "Bixy is taking a short break. Please use the SturdiHome navigation for help.",
  voiceOutputEnabled: true, voiceInputEnabled: true, typedChatEnabled: true,
  animationMode: "basic", mouthAnimationEnabled: true, guidanceEnabled: true,
  pageHelpEnabled: true, sessionPersistence: true, freePreviewSeconds: 60,
  paidAccessEnabled: false,
  pricingJson: [{ id: "character-5m", label: "5 minutes", amountCents: 199, enabled: false }, { id: "character-10m", label: "10 minutes", amountCents: 299, enabled: false }, { id: "character-30m", label: "30 minutes", amountCents: 399, enabled: false }, { id: "character-monthly-60m", label: "Monthly 60 minutes", amountCents: 999, enabled: false }, { id: "character-monthly-unlimited", label: "Monthly unlimited", amountCents: 1999, enabled: false }],
  greeting: "Well hello there. I am Bixy, your dependable SturdiHome guide.",
  fallbackMessage: "I do not have that information. Please use the SturdiHome navigation or contact the SturdiHome team for help.",
  personalityText: "You are Bixy, a male older-man SturdiHome guide. Always use he/him pronouns. Speak warmly, confidently, naturally, and with family-friendly humor.",
  allowedDestinations: ["/", "/services", "/marketplace/vendors", "/marketplace/financing", "/member", "/member/service-request", "/member/financing-request", "/member/appointments", "/member/documents", "/vendor", "/vendor/leads", "/financing", "/financing/referrals", "/how-it-works", "/join-network"],
};

export async function getBixySettings(): Promise<BixySettingsValue> {
  try {
    const value = await prisma.bixySettings.findUnique({ where: { id: "default" } });
    return value ? { ...DEFAULT_BIXY_SETTINGS, ...value, showOnPages: [...value.showOnPages], pricingJson: Array.isArray(value.pricingJson) ? value.pricingJson as BixyPricingPlan[] : DEFAULT_BIXY_SETTINGS.pricingJson, allowedDestinations: Array.isArray(value.allowedDestinations) ? value.allowedDestinations as string[] : DEFAULT_BIXY_SETTINGS.allowedDestinations } : DEFAULT_BIXY_SETTINGS;
  } catch { return DEFAULT_BIXY_SETTINGS; }
}

export function getEffectiveBixySettings(settings: BixySettingsValue) {
  const enabled = settings.enabled && !settings.maintenanceMode;
  return { ...settings, enabled, voiceOutputEnabled: enabled && settings.voiceOutputEnabled, voiceInputEnabled: enabled && settings.voiceInputEnabled, typedChatEnabled: enabled && settings.typedChatEnabled, guidanceEnabled: enabled && settings.guidanceEnabled, pageHelpEnabled: enabled && settings.pageHelpEnabled, paidAccessEnabled: enabled && settings.paidAccessEnabled };
}

export function getPublicBixySettings(settings: BixySettingsValue) {
  const effective = getEffectiveBixySettings(settings);
  return { enabled: effective.enabled, showOnPages: effective.showOnPages, maintenanceMode: settings.maintenanceMode, maintenanceMessage: settings.maintenanceMessage, greeting: settings.greeting, voiceOutputEnabled: effective.voiceOutputEnabled, voiceInputEnabled: effective.voiceInputEnabled, typedChatEnabled: effective.typedChatEnabled, animationMode: effective.animationMode, mouthAnimationEnabled: effective.mouthAnimationEnabled, guidanceEnabled: effective.guidanceEnabled, pageHelpEnabled: effective.pageHelpEnabled, sessionPersistence: effective.sessionPersistence, freePreviewSeconds: effective.freePreviewSeconds, paidAccessEnabled: effective.paidAccessEnabled, pricingJson: effective.pricingJson.map(({ id, label, amountCents, enabled }) => ({ id, label, amountCents, enabled })) };
}