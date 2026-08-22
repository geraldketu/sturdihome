import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { acceptAgreementAction } from "@/lib/actions/member-actions";
import { Badge, Card, SubmitButton } from "@/components/ui";

export default async function AgreementPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const accepted = Boolean(user.agreementAcceptedAt);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Member Agreement</h1>
        <p className="text-sm text-gray-600">
          Please review and accept the SturdiHome Member Agreement to continue.
        </p>
      </div>

      <Card>
        <div className="prose prose-sm max-h-64 overflow-y-auto rounded-md border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
          <p>
            SturdiHome Network LLC (&quot;SturdiHome&quot;) operates a referral network
            connecting homeowners with independent, third-party home-service vendors and
            financing partners. SturdiHome does not perform home-improvement work and is
            not a lender. All financing is provided solely by independent financing
            partners, and all home-service work is performed solely by independent
            vendors. SturdiHome is not a party to any financing agreement or service
            contract between a member and a vendor or financing partner.
          </p>
          <p className="mt-3">
            As a member, you authorize SturdiHome to share your request details with
            relevant vetted vendors and/or financing partners in order to fulfill your
            requests.
          </p>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Badge tone={accepted ? "green" : "gray"}>{accepted ? "Accepted" : "Not yet accepted"}</Badge>
          {accepted && user.agreementAcceptedAt && (
            <span className="text-sm text-gray-500">
              on {user.agreementAcceptedAt.toLocaleDateString()}
            </span>
          )}
        </div>

        {!accepted && (
          <form action={acceptAgreementAction} className="mt-4">
            <SubmitButton pendingText="Submitting...">I Agree and Accept the Member Agreement</SubmitButton>
          </form>
        )}
      </Card>
    </div>
  );
}
