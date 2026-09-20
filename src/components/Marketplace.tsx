import Link from "next/link";
import { CATEGORIES } from "@/lib/marketplace-shared";
import type { ListingPreview } from "@/lib/marketplace";

export function MarketplaceSearch({ category = "", location = "", financing = false }: { category?: string; location?: string; financing?: boolean }) {
  return <form action={financing ? "/marketplace/financing" : "/marketplace/vendors"} method="get" className="grid gap-4 rounded-2xl border border-brand-gold/30 bg-white p-5 text-brand-navy shadow-lg sm:grid-cols-[1fr_1fr_auto]">
    {!financing && <label className="text-sm font-semibold">What service do you need?
      <select name="category" defaultValue={category} className="mt-2 block w-full rounded-lg border border-gray-300 bg-white p-3 font-normal"><option value="">All services</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
    </label>}
    <label className={`text-sm font-semibold ${financing ? "sm:col-span-2" : ""}`}>City or ZIP code
      <input name="location" maxLength={100} defaultValue={location} placeholder="e.g. Atlanta or 30301" className="mt-2 block w-full rounded-lg border border-gray-300 p-3 font-normal" />
    </label>
    <button className="self-end rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">{financing ? "Find Partners" : "Find Vendors"}</button>
  </form>;
}

export function BusinessImage({ src, name, photo = false }: { src: string; name: string; photo?: boolean }) {
  return src ? (
    // Public partner-hosted assets load directly; the server never fetches arbitrary URLs.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={photo ? `${name} project photo` : `${name} logo`} loading="lazy" referrerPolicy="no-referrer" className={photo ? "aspect-[4/3] w-full rounded-xl border border-gray-200 bg-white object-contain" : "h-20 w-20 rounded-xl border border-gray-200 bg-white object-contain"} />
  ) : <div aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-xl bg-brand-gold-pale/40 text-3xl font-semibold text-brand-navy">{name.slice(0, 1)}</div>;
}

export function ListingCard({ listing: p }: { listing: ListingPreview }) {
  return <article className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <BusinessImage src={p.logo} name={p.companyName} />
    <h2 className="break-words text-xl font-semibold text-brand-navy">{p.companyName}</h2>
    <p className="text-sm font-medium text-brand">{p.categories.join(" · ") || "Financing partner"}</p>
    <p className="line-clamp-3 text-sm leading-6 text-gray-600">{p.description}</p>
    <p className="text-sm text-gray-600"><strong>Serves:</strong> {p.areas.join(", ")}</p>
    <Link href={`/marketplace/profiles/${p.id}`} className="mt-auto rounded-lg border border-brand-navy/20 px-4 py-2 text-center font-semibold text-brand-navy hover:bg-brand-gold-pale/30">View Profile</Link>
  </article>;
}

export function CategoryGrid() {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{CATEGORIES.map((c, i) => <Link key={c} href={`/marketplace/vendors?category=${encodeURIComponent(c)}`} className="rounded-xl border border-brand-navy/10 bg-white p-5 font-semibold text-brand-navy shadow-sm hover:border-brand-gold"><span className="mb-3 block text-xs tracking-widest text-brand">{String(i + 1).padStart(2, "0")} / HOME SERVICES</span>{c}<span aria-hidden="true" className="float-right">↗</span></Link>)}</div>;
}

export function MarketplaceIntro({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mb-8 max-w-3xl"><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand">SturdiHome Network</p><h1 className="font-display text-3xl leading-tight text-brand-navy sm:text-5xl">{title}</h1><div className="mt-4 text-base leading-7 text-gray-600">{children}</div></div>;
}
