import { requirePageAccess } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminAccountActions from "@/components/AdminAccountActions";
import { Badge, Card } from "@/components/ui";

export default async function AdminFinancingPartnersPage() {
  await requirePageAccess("/admin/financing-partners");
  const partners = await prisma.financingPartnerProfile.findMany({
    include: { user: true },
    orderBy: { appliedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-dark">Financing Partners</h1>
      <div className="space-y-3">
        {partners.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/admin/financing-partners/${p.id}`} className="font-semibold text-gray-900 hover:text-brand-dark hover:underline">
                  {p.companyName}
                </Link>
                <p className="text-sm text-gray-600">{p.user.name} · {p.user.email}</p>
                <p className="mt-1 text-xs text-gray-500">License: {p.licenseInfo}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge tone={p.status === "APPROVED" ? "green" : p.status === "REJECTED" ? "red" : "yellow"}>
                  {p.status}
                </Badge>
                <Badge tone={p.paymentStatus === "PAID" ? "green" : "gray"}>
                  Payment: {p.paymentStatus}
                </Badge>
              </div>
            </div>
            <div className="mt-3"><AdminAccountActions userId={p.userId} approvalStatus={p.user.approvalStatus} accountStatus={p.user.accountStatus} /></div>
          </Card>
        ))}
        {partners.length === 0 && (
          <Card>
            <p className="text-sm text-gray-500">No financing partner applications yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
