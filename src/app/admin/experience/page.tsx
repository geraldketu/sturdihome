import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateExperienceSettingsAction } from "@/lib/actions/experience-actions";
import { Card } from "@/components/ui";

export default async function AdminExperiencePage() {
  await requirePageAccess("/admin/experience");
  const settings = await prisma.siteExperienceSettings.findUnique({ where: { id: "default" } });
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-brand-dark">Seasonal Experience</h1><p className="text-sm text-gray-600">Control automatic weather, seasonal, holiday, and Bixy accessory presentation. Weather uses permission-based browser location and fails back to the calendar.</p></div>
    <Card>
      <form action={updateExperienceSettingsAction} className="space-y-5">
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="weatherEnabled" defaultChecked={settings?.weatherEnabled ?? true} className="mt-1" /><span><strong className="block text-gray-900">Automatic weather effects</strong><span className="text-gray-600">Request visitor location permission and use current weather when available.</span></span></label>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="seasonalEnabled" defaultChecked={settings?.seasonalEnabled ?? true} className="mt-1" /><span><strong className="block text-gray-900">Seasonal effects</strong><span className="text-gray-600">Enable calendar-based spring, summer, fall, and winter atmosphere.</span></span></label>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="holidayEnabled" defaultChecked={settings?.holidayEnabled ?? true} className="mt-1" /><span><strong className="block text-gray-900">Holiday effects</strong><span className="text-gray-600">Enable temporary Valentine&apos;s, Halloween, Thanksgiving, Christmas, and New Year&apos;s themes.</span></span></label>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="effectsDisabled" defaultChecked={settings?.effectsDisabled ?? false} className="mt-1" /><span><strong className="block text-gray-900">Disable effects immediately</strong><span className="text-gray-600">Leave the website functional while turning off overlays and seasonal presentation.</span></span></label>
        <label className="block text-sm font-medium text-gray-700">Preview theme<select name="previewTheme" defaultValue={settings?.previewTheme ?? "automatic"} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"><option value="automatic">Automatic mode</option><optgroup label="Seasons"><option value="spring">Spring</option><option value="summer">Summer</option><option value="fall">Fall</option><option value="winter">Winter</option></optgroup><optgroup label="Holidays"><option value="valentines">Valentine&apos;s Day</option><option value="halloween">Halloween</option><option value="thanksgiving">Thanksgiving</option><option value="christmas">Christmas / Holiday</option><option value="new-years">New Year&apos;s</option></optgroup></select></label>
        <button type="submit" className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Save experience settings</button>
      </form>
    </Card>
  </div>;
}