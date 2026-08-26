import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { VENDOR_MEMBERSHIP_PRICE_CENTS } from "@/lib/stripe";
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

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Membership &amp; Billing</h1>
        <p className="text-sm text-gray-600">
          An active membership is required to receive homeowner leads.
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

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">SturdiHome Vendor Membership</p>
            <p className="text-sm text-gray-500">
              ${(VENDOR_MEMBERSHIP_PRICE_CENTS / 100).toFixed(2)} / month
            </p>
          </div>
          <Badge tone={tone}>{status}</Badge>
        </div>

        {status === "ACTIVE" && user.vendorProfile.membershipCurrentPeriodEnd && (
          <p className="mt-3 text-sm text-gray-600">
            Renews {user.vendorProfile.membershipCurrentPeriodEnd.toLocaleDateString()}
          </p>
        )}
        {status === "CANCELED" && user.vendorProfile.membershipCanceledAt && (
          <p className="mt-3 text-sm text-gray-600">
            Canceled on {user.vendorProfile.membershipCanceledAt.toLocaleDateString()}. You
            won&apos;t receive new leads until you resubscribe.
          </p>
        )}

        <div className="mt-5 flex gap-3">
          {status === "ACTIVE" || status === "PAST_DUE" ? (
            <form action={openVendorBillingPortalAction}>
              <SubmitButton pendingText="Opening...">Manage Billing</SubmitButton>
            </form>
          ) : (
            <form action={createVendorMembershipCheckoutAction}>
              <SubmitButton pendingText="Redirecting...">Subscribe for ${(VENDOR_MEMBERSHIP_PRICE_CENTS / 100).toFixed(2)}/mo</SubmitButton>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
