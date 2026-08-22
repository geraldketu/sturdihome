import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SidebarNav } from "@/components/SidebarNav";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/financing-partners", label: "Financing Partners" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/documents", label: "Documents" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:gap-8">
      <SidebarNav title="Admin" items={NAV} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
