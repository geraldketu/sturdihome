import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, NoticeBanner } from "@/components/ui";
import { formatCentsRange } from "@/lib/format";
import ServiceRequestForm from "./ServiceRequestForm";

export default async function ServiceRequestPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [requests, vendors] = await Promise.all([
    prisma.serviceRequest.findMany({
      where: { homeownerId: user.id },
      include: { assignedVendor: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.vendorProfile.findMany({
      where: { status: "APPROVED", membershipStatus: "ACTIVE" },
      select: { id: true, companyName: true, serviceArea: true },
      orderBy: { companyName: "asc" },
    }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Home Service Estimator</h1>
        <p className="text-sm text-gray-600">
          Submit a request to be matched with a vetted, independent home-service vendor.
        </p>
      </div>

      {vendors.length === 0 && (
        <NoticeBanner>
          We don&apos;t have home-service vendors live on the site yet. Submitting a
          request below reserves your spot; we&apos;ll reach out personally as soon as we
          have a qualified vendor to match you with.
        </NoticeBanner>
      )}

      <Card>
        <ServiceRequestForm vendors={vendors} />
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-gray-900">Your Requests</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500">No service requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((req) => (
              <li key={req.id} className="rounded-md border border-gray-100 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{req.serviceType}</span>
                  <Badge tone={req.status === "COMPLETED" ? "green" : req.status === "NEW" ? "gray" : "yellow"}>
                    {req.status}
                  </Badge>
                </div>
                <p className="mt-1 text-gray-600">{req.description}</p>
                {req.assignedVendor && (
                  <p className="mt-1 text-xs text-gray-500">
                    Matched with {req.assignedVendor.companyName}
                  </p>
                )}
                {req.estimateLowCents != null && req.estimateHighCents != null && (
                  <p className="mt-2 text-xs text-gray-500">
                    Estimated: {formatCentsRange(req.estimateLowCents, req.estimateHighCents)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
