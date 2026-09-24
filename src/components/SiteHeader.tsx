import Image from "next/image";
import Link from "next/link";
import { getSessionUser, loginDestinationForRole } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";
import { MobileNavToggle } from "@/components/MobileNavToggle";
import { prisma } from "@/lib/prisma";

export default async function SiteHeader() {
  const user = await getSessionUser();
  let optionalNavigation: { id: string; label: string; href: string }[] = [];
  try {
    optionalNavigation = await prisma.siteNavigationItem.findMany({ where: { visible: true }, orderBy: [{ sortOrder: "asc" }, { label: "asc" }], select: { id: true, label: true, href: true } });
  } catch {
    optionalNavigation = [];
  }

  return (
    <header className="relative bg-brand-gold-pale">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="rounded-md bg-white p-1.5 shadow-sm">
          <Image
            src="/images/sturdihome-logo.png"
            alt="SturdiHome Network LLC. Strong Homes. Stronger Communities. Better Futures."
            width={280}
            height={320}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-4 text-sm md:flex">
          {!user && (
            <>
              <Link href="/apply/vendor" className="text-brand-navy/80 hover:text-brand-navy">
                Become a Vendor
              </Link>
              <Link href="/apply/financing" className="text-brand-navy/80 hover:text-brand-navy">
                Become a Financing Partner
              </Link>
              <Link href="/login" className="text-brand-navy/80 hover:text-brand-navy">
                Sign In
              </Link>
              <Link
                href="/join-network"
                className="rounded-md bg-brand-navy px-3 py-1.5 font-medium text-white hover:bg-brand-navy/90"
              >
                Join SturdiHome
              </Link>
            </>
          )}
          {user && (
            <>
              <span className="text-brand-navy/70">
                {user.name} &middot; {roleLabel(user.role)}
              </span>
              <Link
                href={loginDestinationForRole(user.role)}
                className="text-brand-navy/80 hover:text-brand-navy"
              >
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-brand-navy/30 px-3 py-1.5 font-medium text-brand-navy hover:bg-white/40"
                >
                  Sign Out
                </button>
              </form>
            </>
          )}
          <a
            href="mailto:felicia@sturdihomenetwork.com"
            className="rounded-md border border-brand-navy/30 px-3 py-1.5 font-medium text-brand-navy hover:bg-white/40"
          >
            Contact Us
          </a>
          <a
            href="mailto:felicia@sturdihomenetwork.com"
            className="rounded-md bg-brand-navy px-3 py-1.5 font-medium text-white hover:bg-brand-navy/90"
          >
            Chat With SturdiHome
          </a>
          {optionalNavigation.map((item) => <Link key={item.id} href={item.href} className="text-brand-navy/80 hover:text-brand-navy">{item.label}</Link>)}
        </nav>

        <MobileNavToggle>
          {!user && (
            <>
              <Link href="/apply/vendor" className="rounded-md px-2 py-2 text-brand-navy/80 hover:bg-white/40">
                Become a Vendor
              </Link>
              <Link href="/apply/financing" className="rounded-md px-2 py-2 text-brand-navy/80 hover:bg-white/40">
                Become a Financing Partner
              </Link>
              <Link href="/login" className="rounded-md px-2 py-2 text-brand-navy/80 hover:bg-white/40">
                Sign In
              </Link>
              <Link
                href="/join-network"
                className="mt-1 rounded-md bg-brand-navy px-3 py-2 text-center font-medium text-white hover:bg-brand-navy/90"
              >
                Join SturdiHome
              </Link>
            </>
          )}
          {user && (
            <>
              <span className="px-2 py-1 text-brand-navy/70">
                {user.name} &middot; {roleLabel(user.role)}
              </span>
              <Link
                href={loginDestinationForRole(user.role)}
                className="rounded-md px-2 py-2 text-brand-navy/80 hover:bg-white/40"
              >
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="mt-1 w-full rounded-md border border-brand-navy/30 px-3 py-2 text-left font-medium text-brand-navy hover:bg-white/40"
                >
                  Sign Out
                </button>
              </form>
            </>
          )}
          <a
            href="mailto:felicia@sturdihomenetwork.com"
            className="mt-1 rounded-md border border-brand-navy/30 px-2 py-2 text-brand-navy hover:bg-white/40"
          >
            Contact Us
          </a>
          <a
            href="mailto:felicia@sturdihomenetwork.com"
            className="mt-1 rounded-md bg-brand-navy px-2 py-2 text-white hover:bg-brand-navy/90"
          >
            Chat With SturdiHome
          </a>
          {optionalNavigation.map((item) => <Link key={item.id} href={item.href} className="rounded-md px-2 py-2 text-brand-navy/80 hover:bg-white/40">{item.label}</Link>)}
        </MobileNavToggle>
      </div>
      <nav aria-label="Marketplace" className="border-t border-brand-navy/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-3 px-4 py-4 text-sm font-semibold text-brand-navy">
          <Link href="/marketplace/vendors" className="hover:underline">Find Vendors</Link>
          <Link href="/services" className="hover:underline">Services</Link>
          <Link href="/marketplace/financing" className="hover:underline">Financing</Link>
          <Link href="/how-it-works" className="hover:underline">How It Works</Link>
          <Link href="/join-network" className="hover:underline">Join Our Network</Link>
        </div>
      </nav>
    </header>
  );
}

function roleLabel(role: string) {
  switch (role) {
    case "HOMEOWNER":
      return "Member";
    case "VENDOR":
      return "Vendor";
    case "FINANCING_PARTNER":
      return "Financing Partner";
    case "ADMIN":
      return "Admin";
    default:
      return role;
  }
}
