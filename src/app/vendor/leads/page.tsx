import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";
import { formatCentsRange } from "@/lib/format";
import LeadStatusForm from "./LeadStatusForm";
import SetPriceForm from "./SetPriceForm";

export default async function VendorLeadsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!user.vendorProfile) {
    return (
      <Card>
        <p className="text-sm text-gray-600">No vendor profile attached to this account.</p>
      </Card>
    );
  }

  if (user.vendorProfile.membershipStatus !== "ACTIVE") {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <h2 className="font-semibold text-yellow-900">Membership required</h2>
        <p className="mt-2 text-sm text-yellow-800">
          Your vendor membership isn&apos;t active, so leads are on hold. Subscribe to
          start receiving qualified homeowner leads.
        </p>
        <Link
          href="/vendor/membership"
          className="mt-3 inline-block rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Go to Membership
        </Link>
      </Card>
    );
  }

  const leads = await prisma.serviceRequest.findMany({
    where: { assignedVendorId: user.vendorProfile.id },
    include: { homeowner: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Homeowner Leads</h1>
        <p className="text-sm text-gray-600">Qualified homeowner leads assigned to your company.</p>
      </div>

      {leads.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">No leads assigned yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{lead.serviceType}</p>
                  <p className="mt-1 text-sm text-gray-600">{lead.description}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {lead.homeowner.name} · {lead.homeowner.email}
                    {lead.homeowner.phone ? ` · ${lead.homeowner.phone}` : ""}
                  </p>
                  {lead.estimateLowCents != null && lead.estimateHighCents != null && !lead.priceCents && (
                    <p className="mt-1 text-xs text-gray-500">
                      Homeowner&apos;s estimate: {formatCentsRange(lead.estimateLowCents, lead.estimateHighCents)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={lead.status === "COMPLETED" ? "green" : "yellow"}>{lead.status}</Badge>
                  {lead.priceCents && (
                    <Badge tone={lead.paymentStatus === "PAID" ? "green" : "gray"}>
                      ${(lead.priceCents / 100).toFixed(2)} {lead.paymentStatus}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <LeadStatusForm requestId={lead.id} currentStatus={lead.status} />
                {lead.paymentStatus !== "PAID" && (
                  <SetPriceForm requestId={lead.id} priceCents={lead.priceCents} />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
