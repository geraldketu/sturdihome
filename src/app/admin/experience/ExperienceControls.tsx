"use client";

import { useState } from "react";
import SeasonalExperience from "@/components/SeasonalExperience";
import { commitExperienceThemeAction, updateExperienceSettingsAction } from "@/lib/actions/experience-actions";
import { Card } from "@/components/ui";

const themes = ["automatic", "spring", "summer", "fall", "winter", "valentines", "halloween", "thanksgiving", "christmas", "new-years"];

export default function ExperienceControls({ settings }: { settings: { weatherEnabled: boolean; seasonalEnabled: boolean; holidayEnabled: boolean; effectsDisabled: boolean; previewTheme: string | null; activeTheme: string | null } | null }) {
  const current = settings ?? { weatherEnabled: true, seasonalEnabled: true, holidayEnabled: true, effectsDisabled: false, previewTheme: null, activeTheme: null };
  const [selected, setSelected] = useState(current.previewTheme ?? current.activeTheme ?? "automatic");
  const [preview, setPreview] = useState<string | null>(null);
  const previewSettings = { ...current, previewTheme: preview, activeTheme: preview };
  return <>
    <Card><form action={updateExperienceSettingsAction} className="space-y-5">
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="weatherEnabled" defaultChecked={current.weatherEnabled} className="mt-1" /><span><strong className="block text-gray-900">Automatic weather effects</strong><span className="text-gray-600">Request visitor location permission and use current weather when available.</span></span></label>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="seasonalEnabled" defaultChecked={current.seasonalEnabled} className="mt-1" /><span><strong className="block text-gray-900">Seasonal effects</strong><span className="text-gray-600">Enable calendar-based spring, summer, fall, and winter atmosphere.</span></span></label>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="holidayEnabled" defaultChecked={current.holidayEnabled} className="mt-1" /><span><strong className="block text-gray-900">Holiday effects</strong><span className="text-gray-600">Enable temporary holiday themes.</span></span></label>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="effectsDisabled" defaultChecked={current.effectsDisabled} className="mt-1" /><span><strong className="block text-gray-900">Disable effects immediately</strong><span className="text-gray-600">Leave the website functional while turning off overlays and seasonal presentation.</span></span></label>
      <label className="block text-sm font-medium text-gray-700">Preview theme<select name="previewTheme" value={selected} onChange={event => setSelected(event.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"><option value="automatic">Automatic mode</option><optgroup label="Seasons">{themes.slice(1, 5).map(theme => <option key={theme} value={theme}>{theme[0].toUpperCase() + theme.slice(1)}</option>)}</optgroup><optgroup label="Holidays">{themes.slice(5).map(theme => <option key={theme} value={theme}>{theme === "new-years" ? "New Year's" : theme[0].toUpperCase() + theme.slice(1)}</option>)}</optgroup></select></label>
      <div className="flex flex-wrap gap-2"><button type="submit" className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Save Experience Settings</button><button type="button" onClick={() => setPreview(selected)} className="rounded-md border border-brand-navy/30 px-4 py-2 text-sm font-semibold text-brand-navy">Preview</button><button type="submit" formAction={commitExperienceThemeAction} className="rounded-md border border-brand-navy/30 px-4 py-2 text-sm font-semibold text-brand-navy">Commit Live</button><button type="button" onClick={() => setPreview(null)} className="rounded-md border border-brand-navy/30 px-4 py-2 text-sm font-semibold text-brand-navy">Don&apos;t Commit</button></div>
    </form></Card>
    {preview && <Card><h2 className="mb-3 font-semibold text-brand-navy">Preview: {preview}</h2><div className="relative min-h-48 overflow-hidden rounded border border-gray-200"><SeasonalExperience initialSettings={previewSettings}><div className="flex min-h-48 items-center justify-center bg-white/70 p-8 text-center"><p className="text-lg font-semibold text-brand-navy">This is the selected seasonal experience.</p></div></SeasonalExperience></div></Card>}
  </>;
}