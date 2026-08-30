import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";
import ReferralStatusForm from "./ReferralStatusForm";

export default async function FinancingReferralsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!user.financingProfile) {
    return (
      <Card>
        <p className="text-sm text-gray-600">No financing profile attached to this account.</p>
      </Card>
    );
  }

  if (user.financingProfile.paymentStatus !== "PAID") {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <h2 className="font-semibold text-yellow-900">Payment required</h2>
        <p className="mt-2 text-sm text-yellow-800">
          Your onboarding fee hasn&apos;t been paid yet, so referrals are on hold.
        </p>
        <Link
          href="/financing/membership"
          className="mt-3 inline-block rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Go to Payment
        </Link>
      </Card>
    );
  }

  const referrals = await prisma.financingRequest.findMany({
    where: { assignedPartnerId: user.financingProfile.id },
    include: { homeowner: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Financing Referrals</h1>
        <p className="text-sm text-gray-600">Qualified financing referrals assigned to your company.</p>
      </div>

      {referrals.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">No referrals assigned yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {referrals.map((ref) => (
            <Card key={ref.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">${ref.amountRequested.toLocaleString()} requested</p>
                  <p className="mt-1 text-sm text-gray-600">{ref.projectDescription}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {ref.homeowner.name} · {ref.homeowner.email}
                    {ref.homeowner.phone ? ` · ${ref.homeowner.phone}` : ""}
                  </p>
                </div>
                <Badge tone={ref.status === "COMPLETED" ? "green" : "yellow"}>{ref.status}</Badge>
              </div>
              <div className="mt-3">
                <ReferralStatusForm requestId={ref.id} currentStatus={ref.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
