import { approvedAccountWhere } from "@/lib/approval";
import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requirePageAccess } from "@/lib/auth";

// Never include private account contacts, payments, requests or assignments.
export const publicListingSelect = {
  id: true, kind: true, companyName: true, description: true, services: true,
  categories: true, areas: true, website: true, email: true, phone: true,
  logo: true, photos: true,
} satisfies Prisma.MarketplaceListingSelect;
export type PublicListing = Prisma.MarketplaceListingGetPayload<{ select: typeof publicListingSelect }>;
export type ListingPreview = Pick<PublicListing, "id" | "companyName" | "logo" | "categories" | "description" | "areas">;

// Marketing previews only: never serialize contact details, websites or account data
// into the public homepage. Full directory and profile access remains authenticated.
export async function getListingPreviews() {
  try {
    const listings = await prisma.marketplaceListing.findMany({
      where: await eligibility("vendor"), take: 3, orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { companyName: "asc" }, { id: "asc" }],
      select: { id: true, companyName: true, logo: true, categories: true, description: true, areas: true },
    });
    return { available: true, listings };
  } catch { return { available: false, listings: [] as ListingPreview[] }; }
}

export async function eligibility(kind: "vendor" | "financing"): Promise<Prisma.MarketplaceListingWhereInput> {
  const pageKey = kind === "vendor" ? "vendor" : "finance";
  return { kind, published: true, owner: kind === "vendor"
    ? { ...await approvedAccountWhere("VENDOR"), vendorProfile: { is: { status: "APPROVED" } }, pageVisibility: { none: { pageKey } } }
    : { ...await approvedAccountWhere("FINANCING_PARTNER"), financingProfile: { is: { status: "APPROVED" } }, pageVisibility: { none: { pageKey } } } };
}

export async function getListings(kind: "vendor" | "financing", category = "", location = "") {
  const queryParams = new URLSearchParams({ ...(category ? { category } : {}), ...(location ? { location } : {}) });
  await requirePageAccess(`/marketplace/${kind === "vendor" ? "vendors" : "financing"}?${queryParams}`);
  try {
    const listings = await prisma.marketplaceListing.findMany({
      where: { ...await eligibility(kind), ...(category ? { categories: { has: category } } : {}) },
      select: publicListingSelect, orderBy: [{ companyName: "asc" }, { id: "asc" }],
    });
    const query = location.trim().toLocaleLowerCase();
    return { available: true, listings: listings.filter(p => !query || p.areas.some(a => a.toLocaleLowerCase().includes(query))) };
  } catch {
    // An unconfigured directory must not masquerade as zero available vendors.
    return { available: false, listings: [] as PublicListing[] };
  }
}

export async function getListing(id: string) {
  await requirePageAccess(`/marketplace/profiles/${encodeURIComponent(id)}`);
  return prisma.marketplaceListing.findFirst({ where: { id, OR: [await eligibility("vendor"), await eligibility("financing")] }, select: publicListingSelect });
}
