import Link from "next/link";
import { getListings } from "@/lib/marketplace";
import { ListingCard, MarketplaceSearch, MarketplaceIntro } from "@/components/Marketplace";

export const dynamic = "force-dynamic";
export default async function VendorsPage({ searchParams }: { searchParams: Promise<{ category?: string; location?: string }> }) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category.slice(0, 100) : "";
  const location = typeof params.location === "string" ? params.location.slice(0, 100) : "";
  const { available, listings } = await getListings("vendor", category, location);
  return <main className="mx-auto max-w-6xl px-4 py-12">
    <MarketplaceIntro title="Find the right fit for your home.">Explore businesses by service and area. You choose who to contact; browsing never sends your details to vendors.</MarketplaceIntro>
    <MarketplaceSearch category={category} location={location} />
    <p className="my-5 text-sm text-gray-600">Areas match the cities, states, or ZIP codes listed by each business. Confirm coverage directly. Results are alphabetical. <Link className="underline" href="/marketplace/vendors">Clear filters</Link></p>
    {!available ? <p role="status" className="rounded-xl bg-white p-6">The directory is temporarily unavailable. Please try again later.</p> : listings.length ? <><p className="mb-5 text-sm text-brand-navy">{listings.length} matching {listings.length === 1 ? "vendor" : "vendors"}</p><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.map(p => <ListingCard key={p.id} listing={p} />)}</div></> : <div className="rounded-xl border border-brand-gold/30 bg-white p-8"><h2 className="text-xl font-semibold text-brand-navy">No matching vendors yet</h2><p className="mt-2 text-gray-600">Try another service, city, or ZIP code. Our network is growing; your search has not been sent to any business.</p></div>}
  </main>;
}
