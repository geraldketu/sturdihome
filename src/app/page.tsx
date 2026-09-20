import Link from "next/link";
import { Card } from "@/components/ui";
import { MarketplaceSearch, CategoryGrid, ListingCard } from "@/components/Marketplace";
import { getListingPreviews } from "@/lib/marketplace";
import HomepageHeroSlider from "@/components/HomepageHeroSlider";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const directory = await getListingPreviews();
  return (
    <main>
      <section className="bg-brand-navy px-4 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold-pale">Your home. Your neighborhood. Your choice.</p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">A stronger home starts with the right connection.</h1>
          <p className="mb-8 mt-5 max-w-2xl text-base leading-7 text-white/85">Discover local service providers, compare their profiles, and contact the business you choose. You stay in control, from the first search to the first conversation.</p>
          <MarketplaceSearch />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/emergency-services" className="inline-flex min-h-11 items-center rounded-md border border-red-300 bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300">
              Emergency Services
            </Link>
            <p className="text-sm text-white/75">Sign in to search and connect. Your search is never sent to vendors.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><h2 className="font-display text-3xl text-brand-navy">Find help for every corner of home.</h2><Link href="/marketplace/vendors" className="font-semibold text-brand underline">Browse all vendors</Link></div>
        <CategoryGrid />
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="mb-3 font-display text-3xl text-brand-navy">Meet businesses in the network.</h2>
        <p className="mb-6 text-sm text-gray-600">A few published profiles, shown alphabetically. Search by location to find businesses serving your area.</p>
        {directory.listings.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{directory.listings.slice(0, 3).map(listing => <ListingCard key={listing.id} listing={listing} />)}</div> : <p className="rounded-xl border border-brand-gold/30 bg-white p-6 text-gray-600">{directory.available ? "Published vendor profiles will appear here as our network grows." : "Vendor listings are temporarily unavailable. Please check back shortly."}</p>}
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-14 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-7"><h2 className="text-2xl font-semibold text-brand-navy">Search. Compare. Choose.</h2><p className="my-4 leading-7 text-gray-600">Review services, photos, and areas served. When you find the right fit, visit their website, call, or email directly. No bidding or automatic lead distribution.</p><Link href="/how-it-works" className="font-semibold text-brand underline">See how it works</Link></div>
        <div className="rounded-2xl border border-brand-gold/30 bg-brand-gold-pale/30 p-7"><h2 className="text-2xl font-semibold text-brand-navy">Explore financing separately.</h2><p className="my-4 leading-7 text-gray-600">Connect with available financing partners. SturdiHome is not a lender, does not lend money, and does not make financing approval decisions.</p><Link href="/marketplace/financing" className="font-semibold text-brand underline">Browse financing options</Link></div>
      </section>
      <section className="hero-section relative isolate flex items-end overflow-hidden">
        <HomepageHeroSlider />
        <div className="pointer-events-none absolute inset-0 bg-black/10" />
        <div className="pointer-events-none relative mx-auto max-w-6xl px-4 pb-14 pt-10 text-center sm:pb-20">
          <p className="mx-auto max-w-2xl text-sm text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">
            SturdiHome Network LLC is a referral network, not a lender or a contractor.
            We make the introduction, our partners do the work.
          </p>
        </div>
      </section>

      <div className="bg-brand-gold-pale py-3 text-center text-sm font-semibold tracking-wide text-brand-navy">
        Strong Homes. Stronger Communities. Better Futures.
      </div>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          <Card>
            <h2 className="text-lg font-semibold text-brand-dark">For Homeowners</h2>
            <p className="mt-2 text-sm text-gray-600">
              Find trusted service providers and financing options that fit your needs
              and your budget. We make it easy.
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-brand-dark">For Service Providers</h2>
            <p className="mt-2 text-sm text-gray-600">
              Grow your business and get connected with qualified homeowners in your
              service area. We help you thrive.
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold text-brand-dark">For Financing Partners</h2>
            <p className="mt-2 text-sm text-gray-600">
              Partner with us to help homeowners achieve their goals while growing
              stronger communities. We build relationships.
            </p>
          </Card>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-5">
          <TrustBadge
            icon={<ShieldIcon />}
            title="Trusted & Reliable"
            copy="We connect you with pre-screened professionals you can trust."
          />
          <TrustBadge
            icon={<DollarIcon />}
            title="Affordable Solutions"
            copy="Financing options that fit your needs and your budget."
          />
          <TrustBadge
            icon={<HomeIcon />}
            title="Better For Your Family"
            copy="Safer, stronger homes for the people you love."
          />
          <TrustBadge
            icon={<ClockIcon />}
            title="Save Time & Stress"
            copy="We simplify the process so you can focus on what matters."
          />
          <TrustBadge
            icon={<UsersIcon />}
            title="Community Focused"
            copy="Stronger neighbors. Stronger communities. Better futures."
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="rounded-lg border border-brand-gold/40 bg-brand-gold-pale/50 p-6 text-center sm:p-8">
          <h2 className="text-lg font-semibold text-brand-navy">We&apos;re Building Our Partner Network</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-brand-navy/80">
            Availability varies by service and location as our network grows. Browse
            published profiles to see who serves your area, then choose who to contact.
            Searching never submits a request or sends your details to a vendor.
          </p>
        </div>
      </section>

      <section className="bg-brand-navy py-14 text-center">
        <p className="text-2xl font-bold text-white">
          Your Home. Your Family. Your Future.
        </p>
        <p className="mt-1 text-brand-gold">We&apos;re here to help.</p>
      </section>
    </main>
  );
}

function TrustBadge({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-brand-gold">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-brand-dark">{title}</h3>
      <p className="mt-1 text-xs text-gray-600">{copy}</p>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
