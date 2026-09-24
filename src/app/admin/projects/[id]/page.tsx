import Link from "next/link";
import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";

export default async function AdminProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("/admin/projects");
  const { id } = await params;
  const project = await prisma.serviceRequest.findUnique({ where: { id }, include: { homeowner: true, assignedVendor: true, quoteItems: true, changeOrders: true, financingRequests: { include: { assignedPartner: true } }, appointment: true } });
  if (!project) return <Card><p className="text-sm text-gray-600">Project not found.</p></Card>;
  const audits = await prisma.serviceRequestAudit.findMany({ where: { serviceRequestId: id }, orderBy: { createdAt: "desc" } });
  return <div className="space-y-6"><div><Link href="/admin/projects" className="text-sm font-medium text-brand-dark underline">Back to Projects</Link><h1 className="mt-2 text-2xl font-bold text-brand-dark">Project Details</h1></div><Card><h2 className="font-semibold text-gray-900">{project.serviceType}</h2><p className="mt-2 text-sm text-gray-600">Homeowner: {project.homeowner.name} · {project.homeowner.email}</p><p className="text-sm text-gray-600">Vendor: {project.assignedVendor?.companyName ?? "Unassigned"}</p><p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{project.description}</p><p className="mt-3 text-xs text-gray-500">Status: {project.workflowStatus.replaceAll("_", " ")}</p>{project.adminNote && <p className="mt-2 text-sm text-gray-600">Admin note: {project.adminNote}</p>}</Card><Card><h2 className="font-semibold text-gray-900">Activity</h2><div className="mt-3 space-y-2">{audits.map(audit => <p key={audit.id} className="border-b border-gray-100 pb-2 text-sm text-gray-600">{audit.createdAt.toLocaleString()} · {audit.newStatus.replaceAll("_", " ")}{audit.note ? ` · ${audit.note}` : ""}</p>)}{audits.length === 0 && <p className="text-sm text-gray-500">No administrative activity recorded.</p>}</div></Card></div>;
}