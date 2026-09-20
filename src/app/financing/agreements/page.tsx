import { redirect } from "next/navigation";
import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";

export default async function FinancingAgreementsPage() {
  const user = await requirePageAccess("/financing/agreements");
  if (!user) redirect("/login");
  const records = await prisma.agreementAcceptance.findMany({ where: { userId: user.id, role: "FINANCING_PARTNER" }, orderBy: { acceptedAt: "desc" } });
  return <div className="space-y-6"><h1 className="text-2xl font-bold text-brand-dark">Finance Partner Documents / Agreements</h1><Card>{records.length ? records.map(record => <div key={record.id} className="flex items-center justify-between border-b border-gray-100 py-3 text-sm"><span>{record.agreementTitle} · Version {record.version}</span><a className="font-medium text-brand-dark underline" href={`/api/agreements/${record.id}/copy`}>Download signed copy</a></div>) : <p className="text-sm text-gray-600">No signed agreements yet.</p>}</Card></div>;
}