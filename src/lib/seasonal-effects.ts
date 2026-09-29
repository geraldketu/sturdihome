export type SeasonalEffectKind = "image" | "video";

export function seasonalEffectKind(mimeType: string): SeasonalEffectKind {
  return mimeType.startsWith("video/") ? "video" : "image";
}