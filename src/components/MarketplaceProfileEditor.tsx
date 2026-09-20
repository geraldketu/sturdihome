import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MarketplaceProfileForm, { type ListingFields } from "@/components/MarketplaceProfileForm";

export default async function MarketplaceProfileEditor({ ownerId, companyName, services = "", area = "", financing = false }: { ownerId: string; companyName: string; services?: string; area?: string; financing?: boolean }) {
  let listing;
  try { listing = await prisma.marketplaceListing.findUnique({ where: { ownerId } }); }
  catch { return <section className="rounded-xl border border-brand-gold/30 bg-white p-5"><h2 className="text-xl font-semibold text-brand-navy">Public marketplace listing</h2><p className="mt-2 text-sm text-gray-600">The public listing editor is not available yet. Your existing company profile is unchanged.</p></section>; }
  const initial: ListingFields = listing ?? { companyName, description: "", services, areas: area ? [area] : [], categories: [], website: "", email: "", phone: "", logo: "", photos: [], published: false };
  return <section className="rounded-xl border border-brand-gold/30 bg-white p-5"><h2 className="mb-4 text-xl font-semibold text-brand-navy">Public marketplace listing</h2>{listing?.published && <Link href={`/marketplace/profiles/${listing.id}`} className="mb-4 inline-block text-sm text-brand underline">View public profile</Link>}<MarketplaceProfileForm initial={initial} financing={financing} /></section>;
}
