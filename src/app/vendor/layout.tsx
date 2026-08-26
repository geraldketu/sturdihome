import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SidebarNav } from "@/components/SidebarNav";

const NAV = [
  { href: "/vendor", label: "Dashboard" },
  { href: "/vendor/leads", label: "Leads" },
  { href: "/vendor/membership", label: "Membership" },
  { href: "/vendor/profile", label: "Company Profile" },
];

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "VENDOR" && user.role !== "ADMIN")) {
    redirect("/login");
  }
  if (user.role === "VENDOR" && user.vendorProfile?.status !== "APPROVED") {
    redirect("/pending-approval");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:gap-8">
      <SidebarNav title="Vendor Area" items={NAV} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
