import { requirePageAccess } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminAccountActions from "@/components/AdminAccountActions";
import { Badge, Card } from "@/components/ui";

export default async function AdminVendorsPage() {
  await requirePageAccess("/admin/vendors");
  const vendors = await prisma.vendorProfile.findMany({
    include: { user: true },
    orderBy: { appliedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-dark">Vendors</h1>
      <div className="space-y-3">
        {vendors.map((v) => (
          <Card key={v.id}>
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/admin/vendors/${v.id}`} className="font-semibold text-gray-900 hover:text-brand-dark hover:underline">
                  {v.companyName}
                </Link>
                <p className="text-sm text-gray-600">{v.user.name} · {v.user.email}</p>
                <p className="mt-1 text-xs text-gray-500">Service area: {v.serviceArea}</p>
                <p className="text-xs text-gray-500">Services: {v.servicesOffered}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge tone={v.status === "APPROVED" ? "green" : v.status === "REJECTED" ? "red" : "yellow"}>
                  {v.status}
                </Badge>
                <Badge tone={v.membershipStatus === "ACTIVE" ? "green" : "gray"}>
                  Membership: {v.membershipStatus}
                </Badge>
              </div>
            </div>
            <div className="mt-3"><AdminAccountActions userId={v.userId} approvalStatus={v.user.approvalStatus} accountStatus={v.user.accountStatus} /></div>
          </Card>
        ))}
        {vendors.length === 0 && (
          <Card>
            <p className="text-sm text-gray-500">No vendor applications yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
