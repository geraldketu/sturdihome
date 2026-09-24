import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExperienceControls from "./ExperienceControls";

export default async function AdminExperiencePage() {
  await requirePageAccess("/admin/experience");
  const settings = await prisma.siteExperienceSettings.findUnique({ where: { id: "default" } });
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-brand-dark">Seasonal Experience</h1><p className="text-sm text-gray-600">Control automatic weather and seasonal presentation. Weather uses permission-based browser location and fails back to the calendar.</p></div>
    <ExperienceControls settings={settings ? { weatherEnabled: settings.weatherEnabled, seasonalEnabled: settings.seasonalEnabled, holidayEnabled: settings.holidayEnabled, effectsDisabled: settings.effectsDisabled, previewTheme: settings.previewTheme, activeTheme: settings.activeTheme } : null} />
  </div>;
}