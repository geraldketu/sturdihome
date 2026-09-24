"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { classifyWeatherCode, DEFAULT_THEME_SETTINGS, getHoliday, getPreviewTheme, getSeason, type Holiday, type Season, type SiteThemeSettings, type WeatherKind } from "@/lib/seasonal-theme";

type ThemeContextValue = { season: Season; holiday: Holiday; weather: WeatherKind; settings: SiteThemeSettings };
const ThemeContext = createContext<ThemeContextValue>({ season: getSeason(), holiday: getHoliday(), weather: null, settings: DEFAULT_THEME_SETTINGS });

export function useSeasonalTheme() { return useContext(ThemeContext); }

function WeatherEffects({ kind, season }: { kind: WeatherKind; season: Season }) {
  const effectKind = kind === "snow" || kind === "rain" ? kind : season === "spring" ? "rain" : null;
  if (!effectKind && season !== "summer") return null;
  return <div className={`theme-effects theme-effects-${effectKind ?? "summer"}`} aria-hidden="true">
    {effectKind === "snow" && <>{[0, 1, 2, 3, 4].map(index => <span key={index} className={`theme-photo theme-snow-photo theme-snow-photo-${index}`} />)}</>}
    {effectKind === "rain" && <>{[0, 1, 2, 3].map(index => <span key={index} className={`theme-photo theme-rain-photo theme-rain-photo-${index}`} />)}</>}
    {season === "summer" && <span className="theme-photo theme-summer-photo" />}
  </div>;
}

export default function SeasonalExperience({ children, initialSettings }: { children: React.ReactNode; initialSettings?: Partial<SiteThemeSettings> | null }) {
  const settings = useMemo(() => ({ ...DEFAULT_THEME_SETTINGS, ...initialSettings }), [initialSettings]);
  const [weather, setWeather] = useState<WeatherKind>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!settings.weatherEnabled || settings.effectsDisabled || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(coords.latitude)}&longitude=${encodeURIComponent(coords.longitude)}&current=weather_code&timezone=auto`, { signal: AbortSignal.timeout(6000) });
        if (!response.ok) return;
        const data = await response.json() as { current?: { weather_code?: number } };
        if (typeof data.current?.weather_code === "number") setWeather(classifyWeatherCode(data.current.weather_code));
      } catch { /* Calendar fallback remains active. */ }
    }, () => undefined, { maximumAge: 30 * 60 * 1000, timeout: 5000 });
  }, [settings.effectsDisabled, settings.weatherEnabled]);

  const theme = useMemo(() => {
    const selectedTheme = settings.activeTheme === undefined ? settings.previewTheme : settings.activeTheme;
    const preview = getPreviewTheme(selectedTheme);
    const season = settings.seasonalEnabled ? (preview && ["spring", "summer", "fall", "winter"].includes(preview) ? preview as Season : getSeason(now)) : "summer";
    const holiday = settings.holidayEnabled ? (preview && !["spring", "summer", "fall", "winter"].includes(preview) ? preview as Holiday : getHoliday(now)) : null;
    return { season, holiday, weather: settings.effectsDisabled || reducedMotion ? null : weather, settings };
  }, [now, reducedMotion, settings, weather]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <ThemeContext.Provider value={theme}><div className={`seasonal-experience seasonal-${theme.season} ${theme.holiday ? `holiday-${theme.holiday}` : ""} ${theme.settings.effectsDisabled ? "seasonal-effects-disabled" : ""}`}>{!reducedMotion && !theme.settings.effectsDisabled && <WeatherEffects kind={theme.weather} season={theme.season} />}{children}</div></ThemeContext.Provider>;
}