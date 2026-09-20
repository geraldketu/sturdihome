"use client";

import Link from "next/link";
export default function MarketplaceError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-3xl font-semibold text-brand-navy">The directory is temporarily unavailable</h1><p className="my-5 text-gray-600">We couldn&apos;t load this business profile. Please try again shortly.</p><button onClick={reset} className="rounded-lg bg-brand px-5 py-3 text-white">Try again</button><Link href="/marketplace/vendors" className="ml-5 text-brand underline">Back to vendors</Link></main>;
}
