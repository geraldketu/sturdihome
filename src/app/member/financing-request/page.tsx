import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, NoticeBanner } from "@/components/ui";
import FinancingRequestForm from "./FinancingRequestForm";

export default async function FinancingRequestPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [requests, partners] = await Promise.all([
    prisma.financingRequest.findMany({
      where: { homeownerId: user.id },
      include: { assignedPartner: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.financingPartnerProfile.findMany({
      where: { status: "APPROVED", paymentStatus: "PAID" },
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Financing Request</h1>
        <p className="text-sm text-gray-600">
          Submit a request to be matched with a vetted, independent financing partner.
        </p>
      </div>

      {partners.length === 0 && (
        <NoticeBanner>
          We don&apos;t have financing partners live on the site yet. Submitting a request
          below reserves your spot; we&apos;ll reach out personally as soon as we have a
          qualified partner to match you with.
        </NoticeBanner>
      )}

      <Card>
        <FinancingRequestForm partners={partners} />
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-gray-900">Your Requests</h2>
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500">No financing requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((req) => (
              <li key={req.id} className="rounded-md border border-gray-100 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">${req.amountRequested.toLocaleString()}</span>
                  <Badge tone={req.status === "COMPLETED" ? "green" : req.status === "NEW" ? "gray" : "yellow"}>
                    {req.status}
                  </Badge>
                </div>
                <p className="mt-1 text-gray-600">{req.projectDescription}</p>
                {req.assignedPartner && (
                  <p className="mt-1 text-xs text-gray-500">
                    Matched with {req.assignedPartner.companyName}
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
