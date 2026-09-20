import { redirect } from "next/navigation";
import { requirePageAccess } from "@/lib/auth";
import { SidebarNav } from "@/components/SidebarNav";

const NAV = [
  { href: "/vendor", label: "Dashboard" },
  { href: "/vendor/leads", label: "Leads" },
  { href: "/vendor/membership", label: "Membership" },
  { href: "/vendor/flyers", label: "Flyers" },
  { href: "/vendor/profile", label: "Company Profile" },
  { href: "/vendor/agreements", label: "Documents / Agreements" },
  { href: "/vendor/referrals", label: "Customer Referrals" },
  { href: "/account-cancellation", label: "Cancel My Account" },
];

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageAccess("/vendor");
  if (!user || (user.role !== "VENDOR" && user.role !== "ADMIN")) {
    redirect("/login");
  }
  if (user.role === "VENDOR" && user.vendorProfile?.status !== "APPROVED") {
    redirect("/pending-approval");
  }

  return (
    <div className="portal-shell mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:gap-8">
      <SidebarNav title="Vendor Area" items={NAV} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
