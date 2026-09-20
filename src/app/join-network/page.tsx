import Link from "next/link";
import { MarketplaceIntro } from "@/components/Marketplace";
import { safeReturnTo } from "@/lib/access";

export default async function JoinNetworkPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeReturnTo((await searchParams).next);
  const suffix = next ? `?next=${encodeURIComponent(next)}` : "";
  return <main className="mx-auto max-w-6xl px-4 py-12">
    <MarketplaceIntro title={next ? "Join SturdiHome to Continue" : "Join SturdiHome"}>
      Explore our website freely. Create an account and sign in to access SturdiHome services and member tools.
    </MarketplaceIntro>
    <div className="grid gap-5 sm:grid-cols-3">
      {[
        ["Homeowner / Member", "Join SturdiHome to access available home and everyday-life services.", "/signup", "Join as a Homeowner"],
        ["Vendor", "Apply or register to become a SturdiHome Network vendor.", "/apply/vendor", "Apply as a Vendor"],
        ["Finance Partner", "Apply or register to become a SturdiHome financing partner.", "/apply/financing", "Apply as a Financing Partner"],
      ].map(([title, text, href, label]) => <section key={href} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-brand-navy">{title}</h2>
        <p className="my-4 text-sm leading-6 text-gray-600">{text}</p>
        <Link className="mt-auto rounded-lg bg-brand px-4 py-3 text-center text-sm font-semibold text-white" href={href + suffix}>{label}</Link>
      </section>)}
    </div>
    <p className="mt-8 text-center"><Link href={`/login${suffix}`} className="font-semibold text-brand underline">Already a Member? Sign In</Link></p>
    <p className="mt-6 text-center text-sm leading-6 text-gray-600">SturdiHome is not a lender and does not make financing approval decisions.</p>
  </main>;
}
