import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";
import PortalWelcome from "@/components/PortalWelcome";

export default async function VendorDashboardPage() {
  const user = await requirePageAccess("/vendor");
  if (!user) redirect("/login");

  if (!user.vendorProfile) {
    return (
      <Card>
        <p className="text-sm text-gray-600">
          You&apos;re viewing the vendor dashboard as an admin. No vendor profile is
          attached to this account.
        </p>
      </Card>
    );
  }

  const [newLeads, activeLeads, completedLeads] = await Promise.all([
    prisma.serviceRequest.count({ where: { assignedVendorId: user.vendorProfile.id, status: "ASSIGNED" } }),
    prisma.serviceRequest.count({ where: { assignedVendorId: user.vendorProfile.id, status: "IN_PROGRESS" } }),
    prisma.serviceRequest.count({ where: { assignedVendorId: user.vendorProfile.id, status: "COMPLETED" } }),
  ]);

  return (
    <div className="space-y-8">
      <PortalWelcome role="vendor" name={user.name} />
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark">{user.vendorProfile.companyName}</h2>
          <p className="text-sm text-gray-600">Service area: {user.vendorProfile.serviceArea}</p>
        </div>
        <Link href="/vendor/membership" className="flex items-center gap-2">
          <Badge tone={user.vendorProfile.membershipStatus === "ACTIVE" ? "green" : "gray"}>
            Membership: {user.vendorProfile.membershipStatus}
          </Badge>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">New Leads</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{newLeads}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">In Progress</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{activeLeads}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Completed</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{completedLeads}</p>
        </Card>
      </div>
    </div>
  );
}
