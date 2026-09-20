import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import { activateAgreementAction } from "@/lib/actions/admin-actions";

export default async function AdminAgreementsPage() {
  await requirePageAccess("/admin/agreements");
  const [agreements, acceptances] = await Promise.all([
    prisma.networkAgreement.findMany({ orderBy: [{ role: "asc" }, { createdAt: "desc" }] }),
    prisma.agreementAcceptance.findMany({ include: { user: true }, orderBy: { acceptedAt: "desc" } }),
  ]);
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-brand-dark">Agreements</h1><p className="mt-1 text-sm text-gray-600">Current versions, archived versions, and acceptance history.</p></div><Card><h2 className="mb-3 font-semibold text-gray-900">Agreement versions</h2>{agreements.map(agreement => <div key={agreement.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 py-3 text-sm"><div><p className="font-medium">{agreement.title} · {agreement.role}</p><p className="text-gray-500">Version {agreement.version} · Effective {agreement.effectiveDate.toLocaleDateString()}</p></div><div className="flex items-center gap-3"><Badge tone={agreement.active ? "green" : "gray"}>{agreement.active ? "Current" : "Archived"}</Badge>{!agreement.active && <form action={activateAgreementAction}><input type="hidden" name="agreementId" value={agreement.id} /><button className="font-medium text-brand-dark underline">Activate</button></form>}</div></div>)}</Card><Card><h2 className="mb-3 font-semibold text-gray-900">Acceptance history</h2>{acceptances.map(record => <div key={record.id} className="border-b border-gray-100 py-3 text-sm"><p className="font-medium">{record.fullLegalName || record.user.name} · {record.agreementTitle}</p><p className="text-gray-500">{record.role} · Version {record.version} · {record.acceptedAt.toLocaleString()} · Account {record.user.email}</p></div>)}{!acceptances.length && <p className="text-sm text-gray-500">No acceptance records yet.</p>}</Card></div>;
}