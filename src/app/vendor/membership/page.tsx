import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  VENDOR_MEMBERSHIP_TIERS,
  getVendorMembershipTier,
  VENDOR_APPLICATION_FEE_CENTS,
  FOUNDING_VENDOR_LIMIT,
} from "@/lib/stripe";
import { createVendorMembershipCheckoutAction, openVendorBillingPortalAction } from "@/lib/actions/billing-actions";
import { Badge, Card, SubmitButton } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function VendorMembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!user.vendorProfile) {
    return (
      <Card>
        <p className="text-sm text-gray-600">No vendor profile attached to this account.</p>
      </Card>
    );
  }

  const { checkout } = await searchParams;
  const status = user.vendorProfile.membershipStatus;
  const tone = status === "ACTIVE" ? "green" : status === "PAST_DUE" ? "yellow" : "gray";
  const isSubscribed = status === "ACTIVE" || status === "PAST_DUE";
  const currentTier = getVendorMembershipTier(user.vendorProfile.membershipTier);

  const foundingVendorCount = await prisma.vendorProfile.count({ where: { foundingVendor: true } });
  const foundingSpotsLeft = Math.max(0, FOUNDING_VENDOR_LIMIT - foundingVendorCount);
  const isFoundingVendor = user.vendorProfile.foundingVendor;
  const feeAlreadyPaid = Boolean(user.vendorProfile.applicationFeePaidAt);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Membership &amp; Billing</h1>
        <p className="text-sm text-gray-600">
          An active membership is required to receive homeowner leads. Prices shown are
          before tax; the checkout total includes any applicable sales tax.
        </p>
      </div>

      {checkout === "success" && (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Payment received. It may take a few seconds for your membership status to update.
        </p>
      )}
      {checkout === "canceled" && (
        <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          Checkout was canceled. No charge was made.
        </p>
      )}

      {isSubscribed ? (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">SturdiHome Vendor Membership - {currentTier.name}</p>
              <p className="text-sm text-gray-500">${(currentTier.priceCents / 100).toFixed(2)} / month + tax</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge tone={tone}>{status}</Badge>
              {isFoundingVendor && <Badge tone="gold">Founding Vendor</Badge>}
            </div>
          </div>

          {isFoundingVendor && (
            <p className="mt-3 text-sm text-brand-navy">
              As one of our first 100 vendors, your membership is free for your first 6
              months.
            </p>
          )}

          {status === "ACTIVE" && user.vendorProfile.membershipCurrentPeriodEnd && (
            <p className="mt-3 text-sm text-gray-600">
              Renews {user.vendorProfile.membershipCurrentPeriodEnd.toLocaleDateString()}
            </p>
          )}

          <div className="mt-5">
            <form action={openVendorBillingPortalAction}>
              <SubmitButton pendingText="Opening...">Manage Billing</SubmitButton>
            </form>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            A one-time ${(VENDOR_APPLICATION_FEE_CENTS / 100).toFixed(2)} application fee
            {feeAlreadyPaid ? " (already paid)" : ""} applies at checkout, plus your chosen
            monthly plan below.
          </p>

          {foundingSpotsLeft > 0 && (
            <p className="rounded-md border border-brand-gold/40 bg-brand-gold-pale/50 px-3 py-2 text-sm text-brand-navy">
              Founding vendor offer: {foundingSpotsLeft} of {FOUNDING_VENDOR_LIMIT} spots left.
              Check out now and your monthly membership is free for your first 6 months (the
              application fee still applies).
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {VENDOR_MEMBERSHIP_TIERS.map((tier) => (
              <Card key={tier.id}>
                <p className="font-semibold text-gray-900">{tier.name}</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  ${(tier.priceCents / 100).toFixed(2)}
                  <span className="text-sm font-normal text-gray-500"> / month + tax</span>
                </p>
                <p className="mt-2 text-sm text-gray-600">{tier.blurb}</p>
                <form action={createVendorMembershipCheckoutAction} className="mt-4">
                  <input type="hidden" name="tierId" value={tier.id} />
                  <SubmitButton pendingText="Redirecting...">Subscribe to {tier.name}</SubmitButton>
                </form>
              </Card>
            ))}
          </div>
        </div>
      )}

      {status === "CANCELED" && user.vendorProfile.membershipCanceledAt && (
        <p className="text-sm text-gray-600">
          Canceled on {user.vendorProfile.membershipCanceledAt.toLocaleDateString()}. You
          won&apos;t receive new leads until you resubscribe.
        </p>
      )}
    </div>
  );
}
