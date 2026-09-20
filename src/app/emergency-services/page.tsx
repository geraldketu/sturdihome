import Link from "next/link";

export default function EmergencyServicesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <section className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">Emergency Services</p>
        <h1 className="mt-3 font-display text-4xl text-brand-navy">Help is on the way.</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-600">
          Emergency service providers are being added. Please check back soon.
        </p>
        <Link href="/marketplace/vendors" className="mt-8 inline-block rounded-md bg-brand-navy px-5 py-3 font-semibold text-white hover:bg-brand-navy/90">
          Browse available vendors
        </Link>
      </section>
    </main>
  );
}
