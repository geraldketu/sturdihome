import { prisma } from "@/lib/prisma";
import { assignFinancingRequestAction, assignServiceRequestAction } from "@/lib/actions/admin-actions";
import { Badge, Card } from "@/components/ui";
import { formatCentsRange } from "@/lib/format";

export default async function AdminRequestsPage() {
  const [serviceRequests, financingRequests, vendors, partners] = await Promise.all([
    prisma.serviceRequest.findMany({
      include: { homeowner: true, assignedVendor: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.financingRequest.findMany({
      include: { homeowner: true, assignedPartner: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vendorProfile.findMany({ where: { status: "APPROVED" } }),
    prisma.financingPartnerProfile.findMany({ where: { status: "APPROVED" } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Requests</h1>
        <p className="text-sm text-gray-600">Assign homeowner requests to approved vendors and financing partners.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Home Service Estimator Requests</h2>
        {serviceRequests.length === 0 && (
          <Card>
            <p className="text-sm text-gray-500">No service requests yet.</p>
          </Card>
        )}
        {serviceRequests.map((req) => (
          <Card key={req.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{req.serviceType}</p>
                <p className="text-sm text-gray-600">{req.description}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {req.homeowner.name} · {req.homeowner.email}
                </p>
                {req.assignedVendor && (
                  <p className="mt-1 text-xs text-gray-500">Assigned: {req.assignedVendor.companyName}</p>
                )}
                {req.estimateLowCents != null && req.estimateHighCents != null && !req.priceCents && (
                  <p className="mt-1 text-xs text-gray-500">
                    Estimated: {formatCentsRange(req.estimateLowCents, req.estimateHighCents)}
                  </p>
                )}
              </div>
              <Badge tone={req.status === "COMPLETED" ? "green" : req.status === "NEW" ? "gray" : "yellow"}>
                {req.status}
              </Badge>
            </div>
            <form action={assignServiceRequestAction} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="requestId" value={req.id} />
              <select
                name="vendorId"
                defaultValue={req.assignedVendorId ?? ""}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900"
              >
                <option value="" disabled>
                  Assign vendor...
                </option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.companyName}
                  </option>
                ))}
              </select>
              <button className="rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-white hover:bg-gray-900">
                Assign
              </button>
            </form>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Financing Requests</h2>
        {financingRequests.length === 0 && (
          <Card>
            <p className="text-sm text-gray-500">No financing requests yet.</p>
          </Card>
        )}
        {financingRequests.map((req) => (
          <Card key={req.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">${req.amountRequested.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{req.projectDescription}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {req.homeowner.name} · {req.homeowner.email}
                </p>
                {req.assignedPartner && (
                  <p className="mt-1 text-xs text-gray-500">Assigned: {req.assignedPartner.companyName}</p>
                )}
              </div>
              <Badge tone={req.status === "COMPLETED" ? "green" : req.status === "NEW" ? "gray" : "yellow"}>
                {req.status}
              </Badge>
            </div>
            <form action={assignFinancingRequestAction} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="requestId" value={req.id} />
              <select
                name="partnerId"
                defaultValue={req.assignedPartnerId ?? ""}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900"
              >
                <option value="" disabled>
                  Assign financing partner...
                </option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.companyName}
                  </option>
                ))}
              </select>
              <button className="rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-white hover:bg-gray-900">
                Assign
              </button>
            </form>
          </Card>
        ))}
      </section>
    </div>
  );
}
