import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import ProjectOverrideForm from "./ProjectOverrideForm";

export default async function AdminProjectsPage() {
  await requirePageAccess("/admin/projects");
  const projects = await prisma.serviceRequest.findMany({ include: { homeowner: true, assignedVendor: true, quoteItems: true, financingRequests: { include: { assignedPartner: true } }, changeOrders: true, appointment: true }, orderBy: { createdAt: "desc" } });
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-brand-dark">Projects</h1><p className="text-sm text-gray-600">Master view of homeowner projects, vendor quotes, financing, appointments, change orders, and completion.</p></div>{projects.length === 0 ? <Card><p className="text-sm text-gray-500">No projects yet.</p></Card> : <div className="space-y-3">{projects.map(project => <Card key={project.id}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-gray-900">{project.serviceType} · {project.homeowner.name}</p><p className="text-sm text-gray-600">{project.assignedVendor?.companyName ?? "Unassigned vendor"}</p><p className="mt-1 text-xs text-gray-500">{project.workflowStatus.replaceAll("_", " ")}</p>{project.finalQuoteTotalCents != null && <p className="mt-1 text-sm">Final quote: ${(project.finalQuoteTotalCents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })}</p>}{project.financingRequests.map(financing => <p key={financing.id} className="mt-1 text-xs text-gray-500">Lender: {financing.assignedPartner?.companyName ?? "Unassigned"} · {financing.lenderStatus}</p>)}</div><Badge tone={project.workflowStatus === "COMPLETED" ? "green" : "yellow"}>{project.workflowStatus.replaceAll("_", " ")}</Badge></div>{project.workflowStatus !== "COMPLETED" && <ProjectOverrideForm requestId={project.id} />}</Card>)}</div>}</div>;
}
