import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import DisputeForm from "./DisputeForm";
import { isHomeownerVerified } from "@/lib/homeowner-access";

export default async function AccountStatusPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "HOMEOWNER") redirect("/login");
  if (!isHomeownerVerified(user)) redirect("/member");
  const [reports, notifications] = await Promise.all([
    prisma.financingStatusReport.findMany({ where: { memberId: user.id, active: true }, include: { financePartnerProfile: { select: { companyName: true } }, disputes: { orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: "desc" } }),
    prisma.userNotification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  return <div className="max-w-2xl space-y-6"><div><h1 className="text-2xl font-bold text-brand-dark">Account Status</h1><p className="text-sm text-gray-600">SturdiHome reports platform access status only. It does not determine whether a debt is owed or collect payments.</p></div><Card><p className="text-xs uppercase tracking-wide text-gray-500">Financing referral access</p><p className="mt-1 font-semibold text-gray-900">{user.financingAccessStatus === "ACTIVE" ? "Active" : "Financing Access Restricted / Review Required"}</p></Card>{notifications.map(note => <Card key={note.id}><p className="font-semibold text-gray-900">{note.title}</p><p className="mt-2 text-sm leading-6 text-gray-600">{note.body}</p></Card>)}{reports.map(report => <Card key={report.id}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-gray-900">Report from {report.financePartnerProfile.companyName}</p><p className="mt-1 text-sm text-gray-600">Status reported: {report.status}. Questions about balances or payment history must go to the reporting finance partner.</p></div><Badge tone={report.status === "RESOLVED" || report.status === "CURRENT" ? "green" : "yellow"}>{report.status}</Badge></div><div className="mt-4"><h2 className="font-semibold text-gray-900">Dispute or Report an Error</h2><DisputeForm reportId={report.id} existing={report.disputes[0]?.response} /></div></Card>)}{!reports.length && <Card><p className="text-sm text-gray-600">No lender-reported account status issues are on file.</p></Card>}<a href="/account-cancellation" className="font-semibold text-red-700 underline">Cancel My Account</a></div>;
}
