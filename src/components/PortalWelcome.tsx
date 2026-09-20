import Image from "next/image";

const welcomes = {
  homeowner: {
    label: "Homeowner portal",
    headline: "Your home. Your next chapter.",
    description:
      "A stronger home starts with the right connections. Request home services, explore financing options, and keep your documents and appointments together in one place.",
  },
  vendor: {
    label: "Vendor portal",
    headline: "Build your business. Strengthen your community.",
    description:
      "Your expertise makes a difference. Manage your homeowner leads, follow each project from introduction to completion, and keep your business profile up to date.",
  },
  financing: {
    label: "Financing partner portal",
    headline: "Connect with homeowners. Open new possibilities.",
    description:
      "Help homeowners take their next step with confidence. Review your referrals, manage active opportunities, and keep your financing partner profile current.",
  },
} as const;

export default function PortalWelcome({
  role,
  name,
}: {
  role: keyof typeof welcomes;
  name: string;
}) {
  const welcome = welcomes[role];

  return (
    <section
      aria-labelledby="portal-welcome-title"
      className="portal-welcome overflow-hidden rounded-2xl border border-brand-navy/10 bg-white shadow-sm"
    >
      <div className="h-1.5 bg-linear-to-r from-brand-navy via-brand-gold to-brand" />
      <div className="grid gap-6 p-5 sm:grid-cols-[144px_minmax(0,1fr)] sm:items-center sm:p-7 lg:gap-8 lg:p-8">
        <div className="w-32 shrink-0 rounded-xl border border-brand-gold/25 bg-white p-2 sm:w-36">
          <Image
            src="/images/portal-logo.png"
            alt="SturdiHome Network LLC"
            width={1254}
            height={1254}
            sizes="144px"
            className="h-auto w-full object-contain"
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            {welcome.label}
          </p>
          <h1
            id="portal-welcome-title"
            className="mt-3 wrap-anywhere text-2xl font-bold leading-tight text-brand-navy sm:text-3xl"
          >
            Welcome back, {name}.
          </h1>
          <p className="mt-3 text-base font-semibold text-brand-dark">
            {welcome.headline}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            {welcome.description}
          </p>
        </div>
      </div>
      <div className="border-t border-brand-gold/25 bg-brand-gold-pale/30 px-5 py-3 sm:px-7 lg:px-8">
        <p className="text-xs font-medium leading-5 text-brand-navy">
          Strong Homes. Stronger Communities. Better Futures.
        </p>
      </div>
    </section>
  );
}
