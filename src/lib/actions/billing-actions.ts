"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, VENDOR_MEMBERSHIP_PRICE_CENTS, getBaseUrl } from "@/lib/stripe";
import type { ActionState } from "@/lib/actions/auth-actions";

export async function createVendorMembershipCheckoutAction(): Promise<void> {
  const user = await getSessionUser();
  if (!user || user.role !== "VENDOR" || !user.vendorProfile) {
    throw new Error("Not authorized");
  }

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

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "SturdiHome Vendor Membership" },
          recurring: { interval: "month" },
          unit_amount: VENDOR_MEMBERSHIP_PRICE_CENTS,
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/vendor/membership?checkout=success`,
    cancel_url: `${baseUrl}/vendor/membership?checkout=canceled`,
    metadata: { vendorProfileId: user.vendorProfile.id },
    subscription_data: {
      metadata: { vendorProfileId: user.vendorProfile.id },
    },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  redirect(session.url);
}

export async function openVendorBillingPortalAction(): Promise<void> {
  const user = await getSessionUser();
  if (!user || user.role !== "VENDOR" || !user.vendorProfile?.stripeCustomerId) {
    throw new Error("Not authorized");
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.vendorProfile.stripeCustomerId,
    return_url: `${getBaseUrl()}/vendor/membership`,
  });

  redirect(session.url);
}

export async function createServicePaymentCheckoutAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || user.role !== "HOMEOWNER") {
    return { error: "Not authorized" };
  }

  const requestId = String(formData.get("requestId") ?? "");
  const request = await prisma.serviceRequest.findFirst({
    where: { id: requestId, homeownerId: user.id },
  });
  if (!request || !request.priceCents || request.paymentStatus === "PAID") {
    return { error: "This request isn't payable right now." };
  }

  const stripe = getStripe();
  const baseUrl = getBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `SturdiHome service: ${request.serviceType}` },
          unit_amount: request.priceCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/member/service-request?checkout=success`,
    cancel_url: `${baseUrl}/member/service-request?checkout=canceled`,
    metadata: { serviceRequestId: request.id },
  });

  await prisma.serviceRequest.update({
    where: { id: request.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  if (!session.url) {
    return { error: "Stripe did not return a checkout URL." };
  }
  redirect(session.url);
}
