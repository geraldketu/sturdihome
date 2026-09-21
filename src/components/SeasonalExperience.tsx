"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { classifyWeatherCode, DEFAULT_THEME_SETTINGS, getHoliday, getPreviewTheme, getSeason, type Holiday, type Season, type SiteThemeSettings, type WeatherKind } from "@/lib/seasonal-theme";

type ThemeContextValue = { season: Season; holiday: Holiday; weather: WeatherKind; settings: SiteThemeSettings };
const ThemeContext = createContext<ThemeContextValue>({ season: getSeason(), holiday: getHoliday(), weather: null, settings: DEFAULT_THEME_SETTINGS });

export function useSeasonalTheme() { return useContext(ThemeContext); }

function WeatherEffects({ kind, season, holiday }: { kind: WeatherKind; season: Season; holiday: Holiday }) {
  const particles = Array.from({ length: kind === "rain" ? 18 : 12 }, (_, index) => index);
  if (kind !== "snow" && kind !== "rain" && season !== "fall") return null;
  const particleClass = kind === "snow" ? "theme-particle theme-snowflake" : kind === "rain" ? "theme-particle theme-raindrop" : "theme-particle theme-leaf";
  return <div className={`theme-effects theme-effects-${kind ?? season}`} aria-hidden="true">{particles.map((index) => <span key={index} className={particleClass} style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 7) * -0.7}s`, animationDuration: `${4 + (index % 5)}s` }}>{kind === "snow" ? "·" : kind === "rain" ? "" : "•"}</span>)}{holiday === "christmas" && <span className="theme-holiday-sparkle">✦</span>}</div>;
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
    const preview = getPreviewTheme(settings.previewTheme);
    const season = settings.seasonalEnabled ? (preview && ["spring", "summer", "fall", "winter"].includes(preview) ? preview as Season : getSeason(now)) : "summer";
    const holiday = settings.holidayEnabled ? (preview && !["spring", "summer", "fall", "winter"].includes(preview) ? preview as Holiday : getHoliday(now)) : null;
    return { season, holiday, weather: settings.effectsDisabled || reducedMotion ? null : weather, settings };
  }, [now, reducedMotion, settings, weather]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <ThemeContext.Provider value={theme}><div className={`seasonal-experience seasonal-${theme.season} ${theme.holiday ? `holiday-${theme.holiday}` : ""} ${theme.settings.effectsDisabled ? "seasonal-effects-disabled" : ""}`}>{!reducedMotion && !theme.settings.effectsDisabled && <WeatherEffects kind={theme.weather} season={theme.season} holiday={theme.holiday} />}{children}</div></ThemeContext.Provider>;
}