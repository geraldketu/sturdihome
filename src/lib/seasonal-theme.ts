export const SEASONS = ["spring", "summer", "fall", "winter"] as const;
export type Season = (typeof SEASONS)[number];
export type Holiday = "valentines" | "halloween" | "thanksgiving" | "christmas" | "new-years" | null;
export type WeatherKind = "snow" | "rain" | "clear" | "cloudy" | "severe" | null;
export type ThemePreview = "automatic" | Season | Exclude<Holiday, null>;

export type SiteThemeSettings = {
  weatherEnabled: boolean;
  seasonalEnabled: boolean;
  holidayEnabled: boolean;
  effectsDisabled: boolean;
  previewTheme: string | null;
};

export const DEFAULT_THEME_SETTINGS: SiteThemeSettings = {
  weatherEnabled: true,
  seasonalEnabled: true,
  holidayEnabled: true,
  effectsDisabled: false,
  previewTheme: null,
};

export function getSeason(date = new Date()): Season {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

function thanksgivingDay(year: number) {
  const date = new Date(year, 10, 1);
  while (date.getDay() !== 4) date.setDate(date.getDate() + 1);
  date.setDate(date.getDate() + 21);
  return date.getDate();
}

export function getHoliday(date = new Date()): Holiday {
  const month = date.getMonth();
  const day = date.getDate();
  if (month === 1 && day === 14) return "valentines";
  if (month === 9 && day >= 24) return "halloween";
  if (month === 10 && day <= 1) return "halloween";
  if (month === 10 && day >= thanksgivingDay(date.getFullYear()) - 3 && day <= thanksgivingDay(date.getFullYear()) + 3) return "thanksgiving";
  if (month === 11 && day >= 15) return "christmas";
  if (month === 0 && day <= 3) return "new-years";
  if (month === 11 && day >= 27) return "new-years";
  return null;
}

export function getPreviewTheme(value: string | null): ThemePreview | null {
  if (!value || value === "automatic") return null;
  return ([...SEASONS, "valentines", "halloween", "thanksgiving", "christmas", "new-years"] as string[]).includes(value) ? value as ThemePreview : null;
}

export function classifyWeatherCode(code: number): WeatherKind {
  if (code >= 95) return "severe";
  if ((code >= 71 && code <= 86)) return "snow";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code === 0) return "clear";
  if (code >= 1 && code <= 3) return "cloudy";
  return null;
}