import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { VENDOR_MEMBERSHIP_TIERS, getVendorMembershipTier } from "@/lib/stripe";
import { createVendorMembershipCheckoutAction, openVendorBillingPortalAction } from "@/lib/actions/billing-actions";
import { Badge, Card, SubmitButton } from "@/components/ui";

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
            <Badge tone={tone}>{status}</Badge>
          </div>

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
