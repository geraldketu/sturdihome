import Link from "next/link";
import { Card } from "@/components/ui";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-brand-dark sm:text-5xl">
          Home improvements, made sturdier.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          SturdiHome Network connects homeowners with vetted home-service vendors and
          financing partners. SturdiHome Network LLC is a referral network, not a lender
          or a contractor. We make the introduction, our partners do the work.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Join as a Homeowner
          </Link>
          <Link
            href="/apply/vendor"
            className="rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Apply as a Vendor
          </Link>
          <Link
            href="/apply/financing"
            className="rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Apply as a Financing Partner
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold text-brand-dark">Homeowners</h2>
          <p className="mt-2 text-sm text-gray-600">
            Create a membership, submit financing requests, and book home-service
            appointments, all from your member dashboard.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-brand-dark">Vendors</h2>
          <p className="mt-2 text-sm text-gray-600">
            Apply for approval, then receive qualified homeowner leads in your service
            area through your vendor dashboard.
          </p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-brand-dark">Financing Partners</h2>
          <p className="mt-2 text-sm text-gray-600">
            Apply for approval, then receive qualified financing referrals from
            homeowners through your financing dashboard.
          </p>
        </Card>
      </section>
    </main>
  );
}
