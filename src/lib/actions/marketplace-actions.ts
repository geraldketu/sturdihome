"use server";

import { revalidatePath } from "next/cache";
import { getApprovedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingSchema, splitLines } from "@/lib/marketplace-shared";
import { authRateLimited } from "@/lib/auth-throttle";

export async function saveMarketplaceListing(_previous: { error?: string; success?: string }, form: FormData): Promise<{ error?: string; success?: string }> {
  const user = await getApprovedUser();
  const kind = user?.role === "VENDOR" ? "vendor" : user?.role === "FINANCING_PARTNER" ? "financing" : null;
  if (!user || !kind) return { error: "Sign in to your partner account to edit your listing." };
  const profile = kind === "vendor" ? user.vendorProfile : user.financingProfile;
  if (profile?.status !== "APPROVED") return { error: "Your partner application must be approved first." };
  if (await authRateLimited("profile-edit", user.id, 30)) return { error: "Too many updates. Please try again later." };
  const value = (name: string) => String(form.get(name) ?? "");
  const parsed = listingSchema.safeParse({
    companyName: value("companyName"), description: value("description"), services: value("services"),
    categories: kind === "vendor" ? form.getAll("categories") : [],
    areas: splitLines(value("areas")), website: value("website"), email: value("email"), phone: value("phone"),
    logo: value("logo"), photos: value("photos").split("\n").map(v => v.trim()).filter(Boolean), published: form.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your listing fields." };
  if (kind === "vendor" && !parsed.data.categories.length) return { error: "Choose at least one service category." };
  try {
    // Owner is derived from the session, never from a submitted ID.
    const listing = await prisma.marketplaceListing.upsert({ where: { ownerId: user.id }, create: { ownerId: user.id, kind, ...parsed.data }, update: { kind, ...parsed.data } });
    revalidatePath("/marketplace/vendors");
    revalidatePath("/marketplace/financing");
    revalidatePath(`/marketplace/profiles/${listing.id}`);
    revalidatePath(`/${kind === "vendor" ? "vendor" : "financing"}/profile`);
    return { success: parsed.data.published ? "Public listing saved. Homeowners can choose to contact you directly." : "Draft saved. Your listing is not public." };
  } catch {
    return { error: "The listing could not be saved. Please try again when the directory is available." };
  }
}
