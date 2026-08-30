import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { formatCents } from "@/lib/format";
import { getVendorMembershipTier, FINANCING_PARTNER_FEE_CENTS } from "@/lib/stripe";

export default async function AdminOverviewPage() {
  const [
    memberCount,
    vendorCount,
    pendingVendors,
    activeVendors,
    financingPartnerCount,
    pendingFinancingPartners,
    paidFinancingPartners,
    financingRequests,
    serviceRequests,
    appointments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "HOMEOWNER" } }),
    prisma.vendorProfile.count(),
    prisma.vendorProfile.count({ where: { status: "PENDING" } }),
    prisma.vendorProfile.findMany({ where: { membershipStatus: "ACTIVE" }, select: { membershipTier: true } }),
    prisma.financingPartnerProfile.count(),
    prisma.financingPartnerProfile.count({ where: { status: "PENDING" } }),
    prisma.financingPartnerProfile.count({ where: { paymentStatus: "PAID" } }),
    prisma.financingRequest.count(),
    prisma.serviceRequest.count(),
    prisma.appointment.count(),
  ]);

  const monthlyVendorMembershipRevenueCents = activeVendors.reduce(
    (sum, v) => sum + getVendorMembershipTier(v.membershipTier).priceCents,
    0,
  );
  const financingPartnerFeeRevenueCents = paidFinancingPartners * FINANCING_PARTNER_FEE_CENTS;

  const stats = [
    { label: "Homeowners", value: memberCount },
    { label: "Vendors", value: vendorCount, sub: `${pendingVendors} pending approval` },
    { label: "Financing Partners", value: financingPartnerCount, sub: `${pendingFinancingPartners} pending approval` },
    { label: "Financing Requests", value: financingRequests },
    { label: "Service Requests", value: serviceRequests },
    { label: "Appointments", value: appointments },
    {
      label: "Vendor Membership Revenue",
      value: formatCents(monthlyVendorMembershipRevenueCents),
      sub: `${activeVendors.length} active memberships / mo`,
    },
    {
      label: "Financing Partner Fees Collected",
      value: formatCents(financingPartnerFeeRevenueCents),
      sub: `${paidFinancingPartners} paid onboarding fee(s)`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Admin Overview</h1>
        <p className="text-sm text-gray-600">Full control over members, vendors, financing partners, and requests.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-xs uppercase tracking-wide text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{s.value}</p>
            {s.sub && <p className="mt-1 text-xs text-gray-500">{s.sub}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
