import { redirect } from "next/navigation";
import { requirePageAccess } from "@/lib/auth";
import { SidebarNav } from "@/components/SidebarNav";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageAccess("/member");
  if (!user || (user.role !== "HOMEOWNER" && user.role !== "ADMIN")) {
    redirect("/login");
  }
  const nav = [
    { href: "/member", label: "Dashboard" },
    { href: "/member/agreement", label: "Member Agreement" },
    ...(user.homeownerAccountType === "SERVICE_ONLY" ? [] : [
      { href: "/member/standing-agreement", label: "Account Standing Agreement" },
      { href: "/member/documents", label: "Documents" },
      { href: "/member/financing-request", label: "Financing Request" },
      { href: "/account-status", label: "Account Status" },
    ]),
    { href: "/marketplace/vendors", label: "Find a Vendor" },
    { href: "/member/service-request", label: "Home Service Estimator" },
    { href: "/member/appointments", label: "Appointments" },
    { href: "/member/account", label: "Account" },
    { href: "/account-cancellation", label: "Cancel My Account" },
  ];

  return (
    <div className="portal-shell mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:gap-8">
      <SidebarNav title="Member Area" items={nav} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
