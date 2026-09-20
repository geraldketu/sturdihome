import { getListings } from "@/lib/marketplace";
import { ListingCard, MarketplaceSearch, MarketplaceIntro } from "@/components/Marketplace";

export const dynamic = "force-dynamic";
export default async function FinancingOptionsPage({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const params = await searchParams;
  const location = typeof params.location === "string" ? params.location.slice(0, 100) : "";
  const { available, listings } = await getListings("financing", "", location);
  return <main className="mx-auto max-w-6xl px-4 py-12">
    <MarketplaceIntro title="Explore financing, on your terms.">Choose an available financing partner to learn about their options and contact them directly.</MarketplaceIntro>
    <div className="mb-8 rounded-xl border border-brand-gold/40 bg-brand-gold-pale/30 p-5 text-sm leading-6 text-brand-navy">SturdiHome Network is not a lender, does not lend money, and does not make financing approval decisions. Financing providers determine eligibility, terms, and approval. Contact a partner for current details; listing here does not guarantee financing.</div>
    <MarketplaceSearch financing location={location} />
    <p className="my-5 text-sm text-gray-600">Search matches partner-listed service areas. Partners appear alphabetically. This directory is separate from vendor selection.</p>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.map(p => <ListingCard key={p.id} listing={p} />)}</div>
    {!available ? <p role="status" className="rounded-xl bg-white p-6">The financing directory is temporarily unavailable. Please try again later.</p> : !listings.length && <p className="rounded-xl bg-white p-6">No published financing partners match this area yet. Try another location or check back as the network grows.</p>}
  </main>;
}
