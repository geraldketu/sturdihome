import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";
import { formatCents, formatCentsRange } from "@/lib/format";

export default async function AdminMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const member = await prisma.user.findUnique({
    where: { id },
    include: {
      serviceRequests: { include: { assignedVendor: true }, orderBy: { createdAt: "desc" } },
      financingRequests: { include: { assignedPartner: true }, orderBy: { createdAt: "desc" } },
      documents: { orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!member || member.role !== "HOMEOWNER") notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/members" className="text-xs text-gray-500 hover:underline">
          ← Back to Members
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-brand-dark">{member.name}</h1>
        <p className="text-sm text-gray-600">{member.email}{member.phone ? ` · ${member.phone}` : ""}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Agreement</p>
          <div className="mt-1">
            <Badge tone={member.agreementAcceptedAt ? "green" : "gray"}>
              {member.agreementAcceptedAt ? "Signed" : "Pending"}
            </Badge>
          </div>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Joined</p>
          <p className="mt-1 text-sm text-gray-900">{member.createdAt.toLocaleDateString()}</p>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Service Requests</h2>
        {member.serviceRequests.length === 0 && (
          <Card>
            <p className="text-sm text-gray-500">No service requests yet.</p>
          </Card>
        )}
        {member.serviceRequests.map((req) => (
          <Card key={req.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{req.serviceType}</p>
                <p className="text-sm text-gray-600">{req.description}</p>
                {req.assignedVendor && (
                  <p className="mt-1 text-xs text-gray-500">Assigned: {req.assignedVendor.companyName}</p>
                )}
                {req.estimateLowCents != null && req.estimateHighCents != null && (
                  <p className="mt-1 text-xs text-gray-500">
                    Estimated: {formatCentsRange(req.estimateLowCents, req.estimateHighCents)}
                  </p>
                )}
              </div>
              <Badge tone={req.status === "COMPLETED" ? "green" : req.status === "NEW" ? "gray" : "yellow"}>
                {req.status}
              </Badge>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Financing Requests</h2>
        {member.financingRequests.length === 0 && (
          <Card>
            <p className="text-sm text-gray-500">No financing requests yet.</p>
          </Card>
        )}
        {member.financingRequests.map((req) => (
          <Card key={req.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{formatCents(req.amountRequested * 100)} requested</p>
                <p className="text-sm text-gray-600">{req.projectDescription}</p>
                {req.assignedPartner && (
                  <p className="mt-1 text-xs text-gray-500">Assigned: {req.assignedPartner.companyName}</p>
                )}
              </div>
              <Badge tone={req.status === "COMPLETED" ? "green" : req.status === "NEW" ? "gray" : "yellow"}>
                {req.status}
              </Badge>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-900">Documents</h2>
        {member.documents.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-500">No documents uploaded.</p>
          </Card>
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2">Label</th>
                  <th className="px-4 py-2">Uploaded</th>
                  <th className="px-4 py-2">File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {member.documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-4 py-2 text-gray-900">{doc.label}</td>
                    <td className="px-4 py-2 text-gray-500">{doc.uploadedAt.toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <a href={`/api/documents/${doc.id}`} className="font-medium text-brand-dark hover:underline">
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </div>
  );
}
