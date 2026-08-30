import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";

export default async function FinancingDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!user.financingProfile) {
    return (
      <Card>
        <p className="text-sm text-gray-600">
          You&apos;re viewing the financing dashboard as an admin. No financing profile
          is attached to this account.
        </p>
      </Card>
    );
  }

  const [newReferrals, activeReferrals, completedReferrals] = await Promise.all([
    prisma.financingRequest.count({ where: { assignedPartnerId: user.financingProfile.id, status: "ASSIGNED" } }),
    prisma.financingRequest.count({ where: { assignedPartnerId: user.financingProfile.id, status: "IN_PROGRESS" } }),
    prisma.financingRequest.count({ where: { assignedPartnerId: user.financingProfile.id, status: "COMPLETED" } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">{user.financingProfile.companyName}</h1>
          <p className="text-sm text-gray-600">Financing partner dashboard</p>
        </div>
        <Link href="/financing/membership">
          <Badge tone={user.financingProfile.paymentStatus === "PAID" ? "green" : "gray"}>
            Payment: {user.financingProfile.paymentStatus}
          </Badge>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">New Referrals</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{newReferrals}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">In Progress</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{activeReferrals}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Completed</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{completedReferrals}</p>
        </Card>
      </div>
    </div>
  );
}
