import Image from "next/image";
import Link from "next/link";
import { getSessionUser, loginDestinationForRole } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";

export default async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/sturdihome-logo.png"
            alt="SturdiHome Network LLC"
            width={52}
            height={52}
            className="h-11 w-11 object-contain"
            priority
          />
          <span className="hidden text-lg font-bold text-brand-navy sm:inline">
            SturdiHome <span className="font-normal text-gray-500">Network</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {!user && (
            <>
              <Link href="/apply/vendor" className="text-gray-600 hover:text-brand-dark">
                Become a Vendor
              </Link>
              <Link href="/apply/financing" className="text-gray-600 hover:text-brand-dark">
                Become a Financing Partner
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-brand-dark">
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-brand px-3 py-1.5 font-medium text-white hover:bg-brand-dark"
              >
                Join as a Homeowner
              </Link>
            </>
          )}
          {user && (
            <>
              <span className="hidden text-gray-500 sm:inline">
                {user.name} &middot; {roleLabel(user.role)}
              </span>
              <Link
                href={loginDestinationForRole(user.role)}
                className="text-gray-600 hover:text-brand-dark"
              >
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
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
