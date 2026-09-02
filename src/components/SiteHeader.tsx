import Image from "next/image";
import Link from "next/link";
import { getSessionUser, loginDestinationForRole } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";
import { MobileNavToggle } from "@/components/MobileNavToggle";

export default async function SiteHeader() {
  const user = await getSessionUser();

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
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-brand-navy px-3 py-1.5 font-medium text-white hover:bg-brand-navy/90"
              >
                Join as a Homeowner
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
                  Log Out
                </button>
              </form>
            </>
          )}
          <a
            href="mailto:Felicia@sturdihomenetwork.com"
            className="flex flex-col items-center rounded-md border border-brand-navy/30 px-3 py-1.5 font-medium text-brand-navy hover:bg-white/40"
          >
            <span>Contact Us</span>
            <span className="text-xs font-normal text-brand-navy/70">Felicia@sturdihomenetwork.com</span>
          </a>
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
                Log In
              </Link>
              <Link
                href="/signup"
                className="mt-1 rounded-md bg-brand-navy px-3 py-2 text-center font-medium text-white hover:bg-brand-navy/90"
              >
                Join as a Homeowner
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
                  Log Out
                </button>
              </form>
            </>
          )}
          <a
            href="mailto:Felicia@sturdihomenetwork.com"
            className="mt-1 flex flex-col rounded-md border border-brand-navy/30 px-2 py-2 text-brand-navy hover:bg-white/40"
          >
            <span>Contact Us</span>
            <span className="text-xs font-normal text-brand-navy/70">Felicia@sturdihomenetwork.com</span>
          </a>
        </MobileNavToggle>
      </div>
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
