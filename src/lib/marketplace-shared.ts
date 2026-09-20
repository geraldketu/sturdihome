import { z } from "zod";

export const CATEGORIES = ["Roofing", "Plumbing", "Electrical", "Heating & Cooling", "Remodeling", "Landscaping", "Cleaning", "Painting", "Flooring", "Handyman", "Other"] as const;
export const httpsUrl = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}, "Use a complete https:// website or image URL.");
export const listingSchema = z.object({
  companyName: z.string().trim().min(1).max(160),
  description: z.string().trim().min(20, "Add a description of at least 20 characters.").max(3000),
  services: z.string().trim().min(1).max(2000),
  categories: z.array(z.enum(CATEGORIES)).max(11),
  areas: z.array(z.string().trim().min(1).max(100)).min(1, "Add at least one city, state, or ZIP code.").max(100),
  website: httpsUrl,
  email: z.union([z.literal(""), z.string().trim().email().max(254)]),
  phone: z.string().trim().max(40).refine(v => !v || /^[+\d() .-]{7,40}$/.test(v), "Enter a valid public phone number."),
  logo: httpsUrl,
  photos: z.array(httpsUrl.refine(v => !!v)).max(8),
  published: z.boolean(),
}).refine(v => !v.published || !!(v.website || v.email || v.phone), "Add a website, public email, or phone before publishing.");

export function splitLines(value: string) {
  return [...new Set(value.split(/[\n,]/).map(v => v.trim()).filter(Boolean))];
}
