import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setFinancingPartnerStatusAction } from "@/lib/actions/admin-actions";
import { Badge, Card } from "@/components/ui";
import { formatCents } from "@/lib/format";

export default async function AdminFinancingPartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const partner = await prisma.financingPartnerProfile.findUnique({
    where: { id },
    include: {
      user: true,
      financingRequests: { include: { homeowner: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!partner) notFound();

  const totalRequestedCents = partner.financingRequests.reduce((sum, r) => sum + r.amountRequested * 100, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/financing-partners" className="text-xs text-gray-500 hover:underline">
          ← Back to Financing Partners
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-brand-dark">{partner.companyName}</h1>
        <p className="text-sm text-gray-600">{partner.user.name} · {partner.user.email}</p>
        <p className="mt-1 text-xs text-gray-500">License: {partner.licenseInfo}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={partner.status === "APPROVED" ? "green" : partner.status === "REJECTED" ? "red" : "yellow"}>
          {partner.status}
        </Badge>
        {partner.status === "PENDING" && (
          <div className="flex gap-2">
            <form action={setFinancingPartnerStatusAction}>
              <input type="hidden" name="partnerId" value={partner.id} />
              <input type="hidden" name="status" value="APPROVED" />
              <button className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark">
                Approve
              </button>
            </form>
            <form action={setFinancingPartnerStatusAction}>
              <input type="hidden" name="partnerId" value={partner.id} />
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
          <p className="text-xs uppercase tracking-wide text-gray-500">Referrals Assigned</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{partner.financingRequests.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Total Amount Requested</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{formatCents(totalRequestedCents)}</p>
          <p className="mt-1 text-xs text-gray-500">Sum of homeowner-requested amounts, not money paid to SturdiHome</p>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Referrals</h2>
        {partner.financingRequests.length === 0 && (
          <Card>
            <p className="text-sm text-gray-500">No referrals assigned yet.</p>
          </Card>
        )}
        {partner.financingRequests.map((ref) => (
          <Card key={ref.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{formatCents(ref.amountRequested * 100)} requested</p>
                <p className="mt-1 text-sm text-gray-600">{ref.projectDescription}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {ref.homeowner.name} · {ref.homeowner.email}
                  {ref.homeowner.phone ? ` · ${ref.homeowner.phone}` : ""}
                </p>
              </div>
              <Badge tone={ref.status === "COMPLETED" ? "green" : "yellow"}>{ref.status}</Badge>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
