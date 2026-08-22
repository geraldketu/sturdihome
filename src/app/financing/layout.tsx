import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SidebarNav } from "@/components/SidebarNav";

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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:gap-8">
      <SidebarNav title="Financing Area" items={NAV} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
