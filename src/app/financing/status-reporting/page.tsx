import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import StatusReportForm from "./StatusReportForm";
import ReportingAgreementForm from "./ReportingAgreementForm";
import { hasFinanceReportingAcceptance } from "@/lib/finance-reporting-agreement";

export default async function FinancingStatusReportingPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "FINANCING_PARTNER") redirect("/login");
  const reportingAccepted = await hasFinanceReportingAcceptance(user.id);
  if (!reportingAccepted) return <div className="max-w-2xl space-y-6"><h1 className="text-2xl font-bold text-brand-dark">Account Status Reporting</h1><Card><p className="text-sm leading-6 text-gray-600">Review and acknowledge the finance-partner reporting notice before submitting any member account status.</p><ReportingAgreementForm /></Card></div>;
  const relationships = await prisma.financingRequest.findMany({ where: { assignedPartner: { userId: user.id } }, include: { homeowner: { select: { id: true, name: true } }, statusReports: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { createdAt: "desc" } });
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-brand-dark">Account Status Reporting</h1><p className="text-sm leading-6 text-gray-600">Select a financing relationship your company actually manages. SturdiHome is not a debt collector, does not collect payments, and does not share one partner&apos;s reports with another partner.</p></div>{relationships.length ? relationships.map(relationship => <Card key={relationship.id}><p className="font-semibold text-gray-900">Member relationship: {relationship.homeowner.name}</p><p className="mt-1 text-xs text-gray-500">Only the assigned financing relationship is available for reporting.</p><StatusReportForm financingRequestId={relationship.id} latestStatus={relationship.statusReports[0]?.status} /></Card>) : <Card><p className="text-sm text-gray-600">No managed financing relationships are available for status reporting.</p></Card>}</div>;
}
