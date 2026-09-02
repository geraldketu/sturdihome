import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const stripe = getStripe();

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "subscription" && session.metadata?.vendorProfileId) {
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        if (subscriptionId) {
          await syncVendorSubscription(
            session.metadata.vendorProfileId,
            subscriptionId,
            undefined,
            session.metadata.tierId,
          );
          await prisma.vendorProfile.updateMany({
            where: { id: session.metadata.vendorProfileId, applicationFeePaidAt: null },
            data: { applicationFeePaidAt: new Date() },
          });
        }
      }

      if (session.mode === "payment" && session.metadata?.financingPartnerProfileId) {
        await prisma.financingPartnerProfile.update({
          where: { id: session.metadata.financingPartnerProfileId },
          data: {
            paymentStatus: "PAID",
            paidAt: new Date(),
            stripePaymentIntentId:
              typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
          },
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const vendorProfileId = subscription.metadata?.vendorProfileId;
      if (vendorProfileId) {
        await syncVendorSubscription(vendorProfileId, subscription.id, subscription, subscription.metadata?.tierId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function syncVendorSubscription(
  vendorProfileId: string,
  subscriptionId: string,
  preloaded?: Stripe.Subscription,
  tierId?: string,
) {
  const subscription = preloaded ?? (await getStripe().subscriptions.retrieve(subscriptionId));

  const statusMap: Record<Stripe.Subscription.Status, "ACTIVE" | "PAST_DUE" | "CANCELED" | "NONE"> = {
    active: "ACTIVE",
    trialing: "ACTIVE",
    past_due: "PAST_DUE",
    unpaid: "PAST_DUE",
    incomplete: "NONE",
    incomplete_expired: "CANCELED",
    canceled: "CANCELED",
    paused: "CANCELED",
  };

  const item = subscription.items.data[0];
  const currentPeriodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : null;

  await prisma.vendorProfile.update({
    where: { id: vendorProfileId },
    data: {
      stripeSubscriptionId: subscription.id,
      membershipStatus: statusMap[subscription.status] ?? "NONE",
      membershipTier: tierId ?? subscription.metadata?.tierId ?? undefined,
      membershipActivatedAt: subscription.status === "active" ? new Date() : undefined,
      membershipCurrentPeriodEnd: currentPeriodEnd,
      membershipCanceledAt:
        subscription.status === "canceled" ? new Date() : null,
    },
  });
}
