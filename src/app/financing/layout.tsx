import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

const NAV = [
  { href: "/financing", label: "Dashboard" },
  { href: "/financing/referrals", label: "Referrals" },
  { href: "/financing/profile", label: "Company Profile" },
];

export default async function FinancingLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "FINANCING_PARTNER" && user.role !== "ADMIN")) {
    redirect("/login");
  }
  if (user.role === "FINANCING_PARTNER" && user.financingProfile?.status !== "APPROVED") {
    redirect("/pending-approval");
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <aside className="w-56 shrink-0">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Financing Area
        </p>
        <nav className="space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
