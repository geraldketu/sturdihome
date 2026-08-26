import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { formatCents } from "@/lib/format";
import { VENDOR_MEMBERSHIP_PRICE_CENTS } from "@/lib/stripe";

export default async function AdminOverviewPage() {
  const [
    memberCount,
    vendorCount,
    pendingVendors,
    activeVendorMemberships,
    financingPartnerCount,
    pendingFinancingPartners,
    financingRequests,
    serviceRequests,
    appointments,
    paidServiceRequests,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "HOMEOWNER" } }),
    prisma.vendorProfile.count(),
    prisma.vendorProfile.count({ where: { status: "PENDING" } }),
    prisma.vendorProfile.count({ where: { membershipStatus: "ACTIVE" } }),
    prisma.financingPartnerProfile.count(),
    prisma.financingPartnerProfile.count({ where: { status: "PENDING" } }),
    prisma.financingRequest.count(),
    prisma.serviceRequest.count(),
    prisma.appointment.count(),
    prisma.serviceRequest.findMany({ where: { paymentStatus: "PAID" }, select: { priceCents: true } }),
  ]);

  const homeownerPaymentsCents = paidServiceRequests.reduce((sum, r) => sum + (r.priceCents ?? 0), 0);
  const monthlyVendorMembershipRevenueCents = activeVendorMemberships * VENDOR_MEMBERSHIP_PRICE_CENTS;

  const stats = [
    { label: "Homeowners", value: memberCount },
    { label: "Vendors", value: vendorCount, sub: `${pendingVendors} pending approval` },
    { label: "Financing Partners", value: financingPartnerCount, sub: `${pendingFinancingPartners} pending approval` },
    { label: "Financing Requests", value: financingRequests },
    { label: "Service Requests", value: serviceRequests },
    { label: "Appointments", value: appointments },
    { label: "Homeowner Payments Collected", value: formatCents(homeownerPaymentsCents) },
    {
      label: "Vendor Membership Revenue",
      value: formatCents(monthlyVendorMembershipRevenueCents),
      sub: `${activeVendorMemberships} active memberships / mo`,
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
