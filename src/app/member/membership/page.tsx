import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { activateMembershipAction, cancelMembershipAction } from "@/lib/actions/member-actions";
import { Badge, Card, SubmitButton } from "@/components/ui";

export default async function MembershipPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const membership = user.membership;
  const status = membership?.status ?? "NONE";
  const tone = status === "ACTIVE" ? "green" : status === "PAST_DUE" ? "yellow" : "gray";

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Membership &amp; Payment</h1>
        <p className="text-sm text-gray-600">
          Activate your SturdiHome membership to unlock financing requests and
          home-service booking. This is a demo payment flow — no real card is charged.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{membership?.plan ?? "SturdiHome Membership - Standard"}</p>
            <p className="text-sm text-gray-500">
              ${((membership?.priceCents ?? 1900) / 100).toFixed(2)} / month
            </p>
          </div>
          <Badge tone={tone}>{status}</Badge>
        </div>

        {membership?.nextBillingDate && status === "ACTIVE" && (
          <p className="mt-3 text-sm text-gray-600">
            Next billing date: {membership.nextBillingDate.toLocaleDateString()}
          </p>
        )}
        {membership?.canceledAt && status === "CANCELED" && (
          <p className="mt-3 text-sm text-gray-600">
            Canceled on {membership.canceledAt.toLocaleDateString()}. Your restricted
            member benefits are no longer active.
          </p>
        )}

        <div className="mt-5 flex gap-3">
          {status !== "ACTIVE" ? (
            <form action={activateMembershipAction}>
              <SubmitButton pendingText="Activating...">Activate Membership — Pay Now</SubmitButton>
            </form>
          ) : (
            <form action={cancelMembershipAction}>
              <SubmitButton
                className="!bg-red-600 hover:!bg-red-700"
                pendingText="Canceling..."
              >
                Cancel Membership
              </SubmitButton>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
