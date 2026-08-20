import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";
import LeadStatusForm from "./LeadStatusForm";

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
                </div>
                <Badge tone={lead.status === "COMPLETED" ? "green" : "yellow"}>{lead.status}</Badge>
              </div>
              <div className="mt-3">
                <LeadStatusForm requestId={lead.id} currentStatus={lead.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
