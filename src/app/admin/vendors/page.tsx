import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { setVendorStatusAction } from "@/lib/actions/admin-actions";
import { Badge, Card } from "@/components/ui";

export default async function AdminVendorsPage() {
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
            {v.status === "PENDING" && (
              <div className="mt-3 flex gap-2">
                <form action={setVendorStatusAction}>
                  <input type="hidden" name="vendorId" value={v.id} />
                  <input type="hidden" name="status" value="APPROVED" />
                  <button className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark">
                    Approve
                  </button>
                </form>
                <form action={setVendorStatusAction}>
                  <input type="hidden" name="vendorId" value={v.id} />
                  <input type="hidden" name="status" value="REJECTED" />
                  <button className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">
                    Reject
                  </button>
                </form>
              </div>
            )}
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
