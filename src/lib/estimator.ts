export const SERVICE_TYPES = [
  "Roofing",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Windows & Doors",
  "Flooring",
  "Painting",
  "General Repair",
  "Other",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export const SCOPE_OPTIONS = [
  { value: "small", label: "Small / minor repair", multiplier: 0.6 },
  { value: "standard", label: "Standard project", multiplier: 1 },
  { value: "large", label: "Large / full replacement", multiplier: 1.75 },
] as const;

export type Scope = (typeof SCOPE_OPTIONS)[number]["value"];

export const URGENCY_OPTIONS = [
  { value: "standard", label: "Standard timing", multiplier: 1 },
  { value: "urgent", label: "Urgent / rush job", multiplier: 1.15 },
] as const;

export type Urgency = (typeof URGENCY_OPTIONS)[number]["value"];

// Service types priced per square foot in addition to a flat base range.
export const SIZE_SENSITIVE_TYPES: ServiceType[] = ["Roofing", "Flooring"];

// Placeholder ballpark figures for a "standard" scope job with no urgency premium.
// These are illustrative only -- tune to real vendor pricing as it becomes available.
const PRICING_TABLE: Record<ServiceType, { baseLowCents: number; baseHighCents: number; perSqftLowCents?: number; perSqftHighCents?: number }> = {
  Roofing: { baseLowCents: 600_000, baseHighCents: 1_200_000, perSqftLowCents: 450, perSqftHighCents: 850 },
  HVAC: { baseLowCents: 400_000, baseHighCents: 900_000 },
  Plumbing: { baseLowCents: 20_000, baseHighCents: 80_000 },
  Electrical: { baseLowCents: 15_000, baseHighCents: 60_000 },
  "Windows & Doors": { baseLowCents: 50_000, baseHighCents: 250_000 },
  Flooring: { baseLowCents: 200_000, baseHighCents: 500_000, perSqftLowCents: 300, perSqftHighCents: 900 },
  Painting: { baseLowCents: 50_000, baseHighCents: 300_000 },
  "General Repair": { baseLowCents: 15_000, baseHighCents: 120_000 },
  Other: { baseLowCents: 15_000, baseHighCents: 500_000 },
};

function getScopeMultiplier(scope: Scope): number {
  return SCOPE_OPTIONS.find((s) => s.value === scope)?.multiplier ?? 1;
}

function getUrgencyMultiplier(urgency: Urgency): number {
  return URGENCY_OPTIONS.find((u) => u.value === urgency)?.multiplier ?? 1;
}

export interface EstimateInput {
  serviceType: string;
  scope: Scope;
  urgency: Urgency;
  squareFootage?: number | null;
}

export interface EstimateResult {
  lowCents: number;
  highCents: number;
}

export function isSizeSensitive(serviceType: string): boolean {
  return SIZE_SENSITIVE_TYPES.includes(serviceType as ServiceType);
}

export function calculateEstimate(input: EstimateInput): EstimateResult {
  const pricing = PRICING_TABLE[input.serviceType as ServiceType] ?? PRICING_TABLE.Other;
  const scopeMultiplier = getScopeMultiplier(input.scope);
  const urgencyMultiplier = getUrgencyMultiplier(input.urgency);

  let lowCents: number;
  let highCents: number;

  if (
    pricing.perSqftLowCents &&
    pricing.perSqftHighCents &&
    input.squareFootage &&
    input.squareFootage > 0
  ) {
    lowCents = pricing.perSqftLowCents * input.squareFootage;
    highCents = pricing.perSqftHighCents * input.squareFootage;
  } else {
    lowCents = pricing.baseLowCents;
    highCents = pricing.baseHighCents;
  }

  lowCents = Math.round(lowCents * scopeMultiplier * urgencyMultiplier);
  highCents = Math.round(highCents * scopeMultiplier * urgencyMultiplier);

  return { lowCents, highCents };
}
