"use server";

import { redirect } from "next/navigation";
import { getApprovedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getStripe,
  getVendorMembershipTier,
  getBaseUrl,
  getPlaceholderTaxRateId,
  FINANCING_PARTNER_FEE_CENTS,
  VENDOR_APPLICATION_FEE_CENTS,
  FOUNDING_VENDOR_LIMIT,
  FOUNDING_VENDOR_TRIAL_DAYS,
} from "@/lib/stripe";
import type Stripe from "stripe";
import { authRateLimited } from "@/lib/auth-throttle";
import { characterPlan } from "@/lib/character-entitlements";

export async function createVendorMembershipCheckoutAction(formData: FormData): Promise<void> {
  const user = await getApprovedUser();
  if (!user || user.role !== "VENDOR" || user.vendorProfile?.status !== "APPROVED") {
    throw new Error("Not authorized");
  }

  if (await authRateLimited("billing", user.id, 10)) throw new Error("Too many billing requests. Please try again later.");
  const tierId = String(formData.get("tierId") ?? "standard");
  const tier = getVendorMembershipTier(tierId);

  const stripe = getStripe();
  const baseUrl = getBaseUrl();
  let customerId = user.vendorProfile.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.vendorProfile.companyName,
      metadata: { vendorProfileId: user.vendorProfile.id },
    });
    customerId = customer.id;
    await prisma.vendorProfile.update({
      where: { id: user.vendorProfile.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const taxRateId = await getPlaceholderTaxRateId();

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: "usd",
        product_data: { name: `SturdiHome Vendor Membership - ${tier.name}` },
        recurring: { interval: "month" },
        unit_amount: tier.priceCents,
      },
      quantity: 1,
      tax_rates: [taxRateId],
    },
  ];

  if (!user.vendorProfile.applicationFeePaidAt) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: "SturdiHome Vendor Application Fee (one-time)" },
        unit_amount: VENDOR_APPLICATION_FEE_CENTS,
      },
      quantity: 1,
      tax_rates: [taxRateId],
    });
  }

  // The first 100 vendors to check out keep a permanent "founding vendor" flag (reserved
  // here rather than on payment success, so a slot is never handed out twice even if this
  // checkout is abandoned) and get their membership free for their first 6 months. They
  // still pay the application fee above.
  let isFoundingVendor = user.vendorProfile.foundingVendor;
  if (!isFoundingVendor) {
    const foundingVendorCount = await prisma.vendorProfile.count({ where: { foundingVendor: true } });
    if (foundingVendorCount < FOUNDING_VENDOR_LIMIT) {
      isFoundingVendor = true;
      await prisma.vendorProfile.update({
        where: { id: user.vendorProfile.id },
        data: { foundingVendor: true },
      });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: lineItems,
    success_url: `${baseUrl}/vendor/membership?checkout=success`,
    cancel_url: `${baseUrl}/vendor/membership?checkout=canceled`,
    metadata: { vendorProfileId: user.vendorProfile.id, tierId: tier.id },
    subscription_data: {
      metadata: { vendorProfileId: user.vendorProfile.id, tierId: tier.id },
      ...(isFoundingVendor ? { trial_period_days: FOUNDING_VENDOR_TRIAL_DAYS } : {}),
    },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  redirect(session.url);
}

export async function openVendorBillingPortalAction(): Promise<void> {
  const user = await getApprovedUser();
  if (!user || user.role !== "VENDOR" || !user.vendorProfile?.stripeCustomerId) {
    throw new Error("Not authorized");
  }
  if (await authRateLimited("billing", user.id, 10)) throw new Error("Too many billing requests. Please try again later.");

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.vendorProfile.stripeCustomerId,
    return_url: `${getBaseUrl()}/vendor/membership`,
  });

  redirect(session.url);
}

export async function createFinancingPartnerPaymentCheckoutAction(): Promise<void> {
  const user = await getApprovedUser();
  if (!user || user.role !== "FINANCING_PARTNER" || user.financingProfile?.status !== "APPROVED") {
    throw new Error("Not authorized");
  }
  if (await authRateLimited("billing", user.id, 10)) throw new Error("Too many billing requests. Please try again later.");

  const stripe = getStripe();
  const baseUrl = getBaseUrl();
  let customerId = user.financingProfile.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.financingProfile.companyName,
      metadata: { financingPartnerProfileId: user.financingProfile.id },
    });
    customerId = customer.id;
    await prisma.financingPartnerProfile.update({
      where: { id: user.financingProfile.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const taxRateId = await getPlaceholderTaxRateId();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "SturdiHome Financing Partner Onboarding Fee" },
          unit_amount: FINANCING_PARTNER_FEE_CENTS,
        },
        quantity: 1,
        tax_rates: [taxRateId],
      },
    ],
    success_url: `${baseUrl}/financing/membership?checkout=success`,
    cancel_url: `${baseUrl}/financing/membership?checkout=canceled`,
    metadata: { financingPartnerProfileId: user.financingProfile.id },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  redirect(session.url);
}

export async function createCharacterCheckoutAction(formData: FormData): Promise<void> {
  const user = await getApprovedUser();
  if (!user) throw new Error("Not authorized");
  if (process.env.CHARACTER_PAYMENTS_ENABLED !== "true") throw new Error("Character payments are pending final review.");
  if (await authRateLimited("character-billing", user.id, 5)) throw new Error("Too many billing requests. Please try again later.");
  const plan = characterPlan(String(formData.get("plan") ?? ""));
  if (!plan) throw new Error("Invalid character plan");
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [{ price_data: { currency: "usd", product_data: { name: `SturdiHome Character Access - ${plan.name}` }, unit_amount: plan.amountCents }, quantity: 1 }],
    success_url: `${getBaseUrl()}/?character=success`,
    cancel_url: `${getBaseUrl()}/?character=canceled`,
    metadata: { characterUserId: user.id, characterPlanId: plan.id },
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  redirect(session.url);
}
