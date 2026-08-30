import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setVendorStatusAction, setVendorFlyerStatusAction } from "@/lib/actions/admin-actions";
import { Badge, Card } from "@/components/ui";
import { formatCents, formatCentsRange } from "@/lib/format";
import { getVendorMembershipTier } from "@/lib/stripe";

function monthsElapsed(since: Date | null): number {
  if (!since) return 0;
  const now = new Date();
  const months =
    (now.getFullYear() - since.getFullYear()) * 12 + (now.getMonth() - since.getMonth());
  return Math.max(0, months) + 1; // include the current partial month
}

export default async function AdminVendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { id },
    include: {
      user: true,
      serviceRequests: { include: { homeowner: true }, orderBy: { createdAt: "desc" } },
      flyers: { orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!vendor) notFound();

  const tier = getVendorMembershipTier(vendor.membershipTier);
  const estimatedMembershipRevenueCents =
    vendor.membershipStatus === "ACTIVE" || vendor.membershipStatus === "PAST_DUE"
      ? monthsElapsed(vendor.membershipActivatedAt) * tier.priceCents
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/vendors" className="text-xs text-gray-500 hover:underline">
          ← Back to Vendors
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-brand-dark">{vendor.companyName}</h1>
        <p className="text-sm text-gray-600">{vendor.user.name} · {vendor.user.email}</p>
        <p className="mt-1 text-xs text-gray-500">Service area: {vendor.serviceArea}</p>
        <p className="text-xs text-gray-500">Services: {vendor.servicesOffered}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={vendor.status === "APPROVED" ? "green" : vendor.status === "REJECTED" ? "red" : "yellow"}>
          {vendor.status}
        </Badge>
        <Badge tone={vendor.membershipStatus === "ACTIVE" ? "green" : "gray"}>
          Membership: {vendor.membershipStatus}
          {vendor.membershipStatus === "ACTIVE" || vendor.membershipStatus === "PAST_DUE" ? ` (${tier.name})` : ""}
        </Badge>
        {vendor.status === "PENDING" && (
          <div className="flex gap-2">
            <form action={setVendorStatusAction}>
              <input type="hidden" name="vendorId" value={vendor.id} />
              <input type="hidden" name="status" value="APPROVED" />
              <button className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark">
                Approve
              </button>
            </form>
            <form action={setVendorStatusAction}>
              <input type="hidden" name="vendorId" value={vendor.id} />
              <input type="hidden" name="status" value="REJECTED" />
              <button className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">
                Reject
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Est. Membership Revenue</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCents(estimatedMembershipRevenueCents)}</p>
          <p className="mt-1 text-xs text-gray-500">Approximate, based on months since activation</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Membership Renews</p>
          <p className="mt-1 text-sm text-gray-900">
            {vendor.membershipCurrentPeriodEnd ? vendor.membershipCurrentPeriodEnd.toLocaleDateString() : "N/A"}
          </p>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Leads / Submissions</h2>
        {vendor.serviceRequests.length === 0 && (
          <Card>
            <p className="text-sm text-gray-500">No leads assigned yet.</p>
          </Card>
        )}
        {vendor.serviceRequests.map((lead) => (
          <Card key={lead.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{lead.serviceType}</p>
                <p className="mt-1 text-sm text-gray-600">{lead.description}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {lead.homeowner.name} · {lead.homeowner.email}
                  {lead.homeowner.phone ? ` · ${lead.homeowner.phone}` : ""}
                </p>
                {lead.estimateLowCents != null && lead.estimateHighCents != null && (
                  <p className="mt-1 text-xs text-gray-500">
                    Homeowner&apos;s estimate: {formatCentsRange(lead.estimateLowCents, lead.estimateHighCents)}
                  </p>
                )}
              </div>
              <Badge tone={lead.status === "COMPLETED" ? "green" : "yellow"}>{lead.status}</Badge>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Promotional Flyers</h2>
        {vendor.flyers.length === 0 && (
          <Card>
            <p className="text-sm text-gray-500">No flyers submitted yet.</p>
          </Card>
        )}
        {vendor.flyers.map((flyer) => (
          <Card key={flyer.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{flyer.label}</p>
                <p className="text-xs text-gray-500">Submitted {flyer.uploadedAt.toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={flyer.status === "APPROVED" ? "green" : flyer.status === "REJECTED" ? "red" : "yellow"}>
                  {flyer.status}
                </Badge>
                <a
                  href={`/api/vendor-flyers/${flyer.id}`}
                  className="text-xs font-medium text-brand-dark hover:underline"
                >
                  View
                </a>
                {flyer.status === "PENDING" && (
                  <>
                    <form action={setVendorFlyerStatusAction}>
                      <input type="hidden" name="flyerId" value={flyer.id} />
                      <input type="hidden" name="vendorId" value={vendor.id} />
                      <input type="hidden" name="status" value="APPROVED" />
                      <button className="rounded-md bg-brand px-2 py-1 text-xs font-medium text-white hover:bg-brand-dark">
                        Approve
                      </button>
                    </form>
                    <form action={setVendorFlyerStatusAction}>
                      <input type="hidden" name="flyerId" value={flyer.id} />
                      <input type="hidden" name="vendorId" value={vendor.id} />
                      <input type="hidden" name="status" value="REJECTED" />
                      <button className="rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50">
                        Reject
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
