import Image from "next/image";
import Link from "next/link";
import { getSessionUser, loginDestinationForRole } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";

export default async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="bg-brand-gold-pale">
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
        <nav className="flex items-center gap-4 text-sm">
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
              <span className="hidden text-brand-navy/70 sm:inline">
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
        </nav>
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
