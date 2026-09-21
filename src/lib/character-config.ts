export const CHARACTER_INTERACTION_SECONDS = 1;
export const CHARACTER_FREE_SECONDS = 60;

export const CHARACTER_PLANS = {
  fiveMinute: { id: "character-5m", name: "5 minutes", amountCents: 499, seconds: 5 * 60, days: null, blurb: "$4.99 upfront, used until exhausted." },
  tenMinute: { id: "character-10m-7d", name: "10 minutes / 7 days", amountCents: 1999, seconds: 10 * 60, days: 7, blurb: "$19.99 upfront, expires after 7 days or when used." },
} as const;
export type CharacterPlanId = keyof typeof CHARACTER_PLANS;

export const CHARACTER_VOICES = {
  brixy: { label: "Brixy", gender: "male", pronouns: "he/him", voiceStyle: "deep, gravelly, raspy, warm older-man voice", browserVoiceHint: "male", rate: 0.86, pitch: 0.62, referenceAudioPath: "data/character-voices/brixy-approved.wav" },
} as const;

export const CHARACTER_TALKING_VIDEO_AVAILABLE = {
  brixy: true,
} as const;
