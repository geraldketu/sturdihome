import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SidebarNav } from "@/components/SidebarNav";

// Order mirrors the intended member flow: log in, agree to terms, upload documents,
// submit a home-service request (with the cost estimator), then a financing request,
// then book an appointment.
const NAV = [
  { href: "/member", label: "Dashboard" },
  { href: "/member/agreement", label: "Member Agreement" },
  { href: "/member/documents", label: "Documents" },
  { href: "/member/service-request", label: "Home Service Estimator" },
  { href: "/member/financing-request", label: "Financing Request" },
  { href: "/member/appointments", label: "Appointments" },
  { href: "/member/account", label: "Account" },
];

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "HOMEOWNER" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:gap-8">
      <SidebarNav title="Member Area" items={NAV} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
