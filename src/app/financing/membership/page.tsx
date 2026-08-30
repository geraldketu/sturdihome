import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { FINANCING_PARTNER_FEE_CENTS } from "@/lib/stripe";
import { createFinancingPartnerPaymentCheckoutAction } from "@/lib/actions/billing-actions";
import { Badge, Card, SubmitButton } from "@/components/ui";

export default async function FinancingPartnerPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!user.financingProfile) {
    return (
      <Card>
        <p className="text-sm text-gray-600">No financing partner profile attached to this account.</p>
      </Card>
    );
  }

  const { checkout } = await searchParams;
  const paid = user.financingProfile.paymentStatus === "PAID";

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Payment</h1>
        <p className="text-sm text-gray-600">
          A one-time onboarding fee is required to start receiving homeowner financing
          referrals. Price shown is before tax; the checkout total includes any
          applicable sales tax.
        </p>
      </div>

      {checkout === "success" && (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Payment received. It may take a few seconds for your account to update.
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
            <p className="font-semibold text-gray-900">SturdiHome Financing Partner Onboarding Fee</p>
            <p className="text-sm text-gray-500">
              ${(FINANCING_PARTNER_FEE_CENTS / 100).toFixed(2)} one-time + tax
            </p>
          </div>
          <Badge tone={paid ? "green" : "gray"}>{user.financingProfile.paymentStatus}</Badge>
        </div>

        {paid && user.financingProfile.paidAt && (
          <p className="mt-3 text-sm text-gray-600">Paid on {user.financingProfile.paidAt.toLocaleDateString()}</p>
        )}

        {!paid && (
          <div className="mt-5">
            <form action={createFinancingPartnerPaymentCheckoutAction}>
              <SubmitButton pendingText="Redirecting...">
                Pay ${(FINANCING_PARTNER_FEE_CENTS / 100).toFixed(2)}
              </SubmitButton>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
