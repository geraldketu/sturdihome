import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExperienceControls from "./ExperienceControls";

export default async function AdminExperiencePage() {
  await requirePageAccess("/admin/experience");
  const effects = await prisma.seasonalEffect.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, select: { id: true, originalName: true, mimeType: true, byteSize: true, active: true } });
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-brand-dark">Seasonal Experience</h1><p className="text-sm text-gray-600">Control automatic weather and seasonal presentation. Weather uses permission-based browser location and fails back to the calendar.</p></div>
    <ExperienceControls effects={effects} />
  </div>;
}