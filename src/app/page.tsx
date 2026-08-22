import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui";

export default function HomePage() {
  return (
    <main>
      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/hero-living-room.png"
          alt="A cozy living room with a stone fireplace"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:py-32">
          <p className="text-xs font-semibold uppercase tracking-widest text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            SturdiHome Network LLC
          </p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-5xl font-semibold text-brand-navy drop-shadow-[0_2px_10px_rgba(255,255,255,0.85)] sm:text-6xl">
            A place where homeowners find a solution.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">
            We connect homeowners with trusted service providers and financing partners
            to make home improvement simple, affordable, and stress-free.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]">
            SturdiHome Network LLC is a referral network, not a lender or a contractor.
            We make the introduction, our partners do the work.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-md bg-brand-navy px-5 py-3 text-sm font-semibold text-white hover:bg-brand-navy/90"
            >
              Join as a Homeowner
            </Link>
            <Link
              href="/apply/vendor"
              className="rounded-md border border-brand-navy/15 bg-white px-5 py-3 text-sm font-semibold text-brand-navy hover:bg-brand-gold-pale"
            >
              Apply as a Vendor
            </Link>
            <Link
              href="/apply/financing"
              className="rounded-md border border-brand-navy/15 bg-white px-5 py-3 text-sm font-semibold text-brand-navy hover:bg-brand-gold-pale"
            >
              Apply as a Financing Partner
            </Link>
          </div>
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
            Heads up: we don&apos;t have home-service vendors or financing partners live
            on the site yet. Homeowners can still create an account and submit requests
            today; we&apos;ll hold them and reach out personally as soon as we have a
            qualified, vetted partner in your area.
          </p>
        </div>
      </section>

      <section className="bg-brand-navy py-14 text-center">
        <p className="text-2xl font-bold text-white">
          Your Home. Your Family. Your Future.
        </p>
        <p className="mt-1 text-brand-gold">We&apos;re here to help.</p>
        <div className="mt-6">
          <Link
            href="/signup"
            className="rounded-md bg-brand-gold px-6 py-3 text-sm font-semibold text-brand-navy hover:brightness-95"
          >
            Join as a Homeowner
          </Link>
        </div>
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
