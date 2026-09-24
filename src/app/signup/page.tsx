import Link from "next/link";
import { Card } from "@/components/ui";

export default async function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-bold text-brand-dark">
        Sign Up for SturdiHome
      </h1>
      <p className="mb-6 text-center text-sm text-gray-600">
        Choose the account that matches how you want to participate in SturdiHome.
      </p>
      <div className="space-y-3">
        <Card><h2 className="font-semibold text-brand-navy">Homeowner</h2><p className="mt-1 text-sm text-gray-600">Join as a homeowner member and connect with services and financing options.</p><Link href="/signup/homeowner" className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white">Continue as Homeowner</Link></Card>
        <Card><h2 className="font-semibold text-brand-navy">Vendor</h2><p className="mt-1 text-sm text-gray-600">Apply to join the SturdiHome service provider network.</p><Link href="/apply/vendor" className="mt-4 inline-block rounded-md border border-brand-navy/30 px-4 py-2 text-sm font-semibold text-brand-navy">Continue as Vendor</Link></Card>
        <Card><h2 className="font-semibold text-brand-navy">Financing Partner</h2><p className="mt-1 text-sm text-gray-600">Apply to become a SturdiHome financing partner.</p><Link href="/apply/financing" className="mt-4 inline-block rounded-md border border-brand-navy/30 px-4 py-2 text-sm font-semibold text-brand-navy">Continue as Financing Partner</Link></Card>
      </div>
    </main>
  );
}
