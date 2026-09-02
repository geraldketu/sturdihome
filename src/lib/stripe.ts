import "server-only";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export interface VendorMembershipTier {
  id: string;
  name: string;
  priceCents: number;
  blurb: string;
}

// Placeholder tiers/pricing -- adjust to whatever's actually approved.
export const VENDOR_MEMBERSHIP_TIERS: VendorMembershipTier[] = [
  { id: "standard", name: "Standard", priceCents: 4999, blurb: "Receive homeowner leads in your service area." },
  { id: "pro", name: "Pro", priceCents: 19999, blurb: "Priority lead placement and higher monthly lead volume." },
];

export function getVendorMembershipTier(tierId: string | null | undefined): VendorMembershipTier {
  return VENDOR_MEMBERSHIP_TIERS.find((t) => t.id === tierId) ?? VENDOR_MEMBERSHIP_TIERS[0];
}

// One-time application fee, charged once per vendor on their first membership checkout.
export const VENDOR_APPLICATION_FEE_CENTS = 9900;

// The first 100 vendors to check out still pay the application fee above, but their
// monthly membership is free for their first 6 months.
export const FOUNDING_VENDOR_LIMIT = 100;
export const FOUNDING_VENDOR_TRIAL_DAYS = 180;

// Placeholder one-time onboarding fee for financing partners -- adjust as needed.
export const FINANCING_PARTNER_FEE_CENTS = 19999;

const TAX_RATE_DISPLAY_NAME = "SturdiHome Estimated Sales Tax";
const PLACEHOLDER_TAX_PERCENTAGE = 8;
let cachedTaxRateId: string | null = null;

// Stripe's automatic tax calculation (Stripe Tax) requires a business address to be
// configured in the Stripe Dashboard's Tax settings, which isn't something this code can
// set up on its own. Until that's done, checkout totals use this flat placeholder rate
// instead, so "final price includes tax" is actually true today rather than only once
// someone configures Stripe Tax. Swap to automatic_tax once the dashboard is configured.
export async function getPlaceholderTaxRateId(): Promise<string> {
  if (cachedTaxRateId) return cachedTaxRateId;

  const stripe = getStripe();
  const existing = await stripe.taxRates.list({ active: true, limit: 100 });
  const found = existing.data.find((r) => r.display_name === TAX_RATE_DISPLAY_NAME);
  if (found) {
    cachedTaxRateId = found.id;
    return found.id;
  }

  const created = await stripe.taxRates.create({
    display_name: TAX_RATE_DISPLAY_NAME,
    percentage: PLACEHOLDER_TAX_PERCENTAGE,
    inclusive: false,
    description: "Placeholder flat rate -- replace with Stripe Tax once a business address is configured.",
  });
  cachedTaxRateId = created.id;
  return created.id;
}

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  // VERCEL_URL is the per-deployment URL, which carries Vercel's SSO/deployment
  // protection outside of the aliased production domain. The stable production
  // domain is VERCEL_PROJECT_PRODUCTION_URL instead.
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
