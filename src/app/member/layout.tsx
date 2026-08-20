import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

const NAV = [
  { href: "/member", label: "Dashboard" },
  { href: "/member/membership", label: "Membership" },
  { href: "/member/agreement", label: "Member Agreement" },
  { href: "/member/documents", label: "Documents" },
  { href: "/member/financing-request", label: "Financing Request" },
  { href: "/member/service-request", label: "Home-Service Request" },
  { href: "/member/appointments", label: "Appointments" },
  { href: "/member/account", label: "Account" },
];

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "HOMEOWNER" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <aside className="w-56 shrink-0">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Member Area
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
