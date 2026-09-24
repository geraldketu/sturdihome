import { approvedAccountWhere } from "@/lib/approval";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, NoticeBanner } from "@/components/ui";
import PortalWelcome from "@/components/PortalWelcome";
import MemberProjectActions from "./MemberProjectActions";
import { ensureBirthdayNotification } from "@/lib/notifications";

export default async function MemberDashboardPage() {
  const user = await requirePageAccess("/member");
  if (!user) redirect("/login");
  await ensureBirthdayNotification({ id: user.id, dateOfBirth: user.dateOfBirth });

  const [documentCount, financingRequests, serviceRequests, appointments, activeVendorCount, paidPartnerCount] =
    await Promise.all([
      prisma.document.count({ where: { userId: user.id } }),
      prisma.financingRequest.count({ where: { homeownerId: user.id } }),
      prisma.serviceRequest.findMany({ where: { homeownerId: user.id }, include: { assignedVendor: true, quoteItems: true, changeOrders: true }, orderBy: { createdAt: "desc" } }),
      prisma.appointment.count({ where: { homeownerId: user.id } }),
      prisma.vendorProfile.count({ where: { status: "APPROVED", membershipStatus: "ACTIVE", user: await approvedAccountWhere("VENDOR") } }),
      prisma.financingPartnerProfile.count({ where: { status: "APPROVED", paymentStatus: "PAID", user: await approvedAccountWhere("FINANCING_PARTNER") } }),
    ]);
  const noPartnersYet = activeVendorCount === 0 && paidPartnerCount === 0;

  const agreementAccepted = Boolean(user.agreementAcceptedAt);
  const serviceOnly = user.homeownerAccountType === "SERVICE_ONLY";
  const verified = user.homeownerVerificationStatus === "VERIFIED";

  const steps = serviceOnly ? [
    { label: "Create service-only account", done: true },
    { label: "Sign member agreement", done: agreementAccepted, href: "/member/agreement" },
  ] : [
    { label: "Create account", done: true },
    { label: "Sign member agreement", done: agreementAccepted, href: "/member/agreement" },
    { label: "Upload one proof of homeownership", done: verified, href: "/member/documents" },
  ];
  const remaining = steps.filter((s) => !s.done);

  return (
    <div className="space-y-8">
      <PortalWelcome role="homeowner" name={user.name} />

      {serviceOnly && <NoticeBanner>Service-only account: search and connect with vendors without homeownership verification. Financing features that require homeowner verification are unavailable.</NoticeBanner>}

      {noPartnersYet && (
        <NoticeBanner>
          We&apos;re still building our network of vendors and financing partners, so none
          are live on the site yet. Any request you submit below will be held, and
          we&apos;ll reach out personally as soon as we have a qualified partner for you.
        </NoticeBanner>
      )}

      {remaining.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <h2 className="font-semibold text-yellow-900">Finish setting up your account</h2>
          <ul className="mt-3 space-y-2">
            {steps.map((step) => (
              <li key={step.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Badge tone={step.done ? "green" : "gray"}>{step.done ? "Done" : "To do"}</Badge>
                  {step.label}
                </span>
                {!step.done && step.href && (
                  <Link href={step.href} className="font-medium text-brand-dark hover:underline">
                    Complete →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {!serviceOnly && <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Documents</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{documentCount} uploaded</p>
          <Link href="/member/documents" className="mt-2 inline-block text-sm text-brand-dark hover:underline">
            Manage →
          </Link>
        </Card>}
        {!serviceOnly && <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Home Service Estimator</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{serviceRequests.length}</p>
          <Link href="/member/service-request" className="mt-2 inline-block text-sm text-brand-dark hover:underline">
            View / Submit →
          </Link>
        </Card>}
        {!serviceOnly && <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Financing Requests</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{financingRequests}</p>
          <Link href="/member/financing-request" className="mt-2 inline-block text-sm text-brand-dark hover:underline">
            View / Submit →
          </Link>
        </Card>}
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Appointments</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{appointments} scheduled</p>
          <Link href="/member/appointments" className="mt-2 inline-block text-sm text-brand-dark hover:underline">
            View →
          </Link>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Community Room</p>
          <p className="mt-1 text-sm text-gray-600">Coming soon for SturdiHome members.</p>
          <span className="mt-2 inline-block text-sm font-medium text-gray-400">Coming soon</span>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-brand-navy">My Projects</h2>
        {serviceRequests.length === 0 ? <Card><p className="text-sm text-gray-500">No service projects yet.</p></Card> : serviceRequests.map((project) => <Card key={project.id}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-gray-900">{project.serviceType}</p><p className="mt-1 text-sm text-gray-600">{project.assignedVendor?.companyName ?? "Vendor matching in progress"}</p><p className="mt-1 text-xs text-gray-500">{project.workflowStatus.replaceAll("_", " ")}</p>{project.finalQuoteTotalCents != null && <p className="mt-1 text-sm text-brand-navy">Final quote: ${(project.finalQuoteTotalCents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" })}</p>}{project.changeOrders.filter(order => order.status === "PENDING_HOMEOWNER").map(order => <p key={order.id} className="mt-1 text-xs text-red-700">Change order: ${(order.requestedAmountCents / 100).toFixed(2)} · {order.reason}</p>)}</div><Badge tone={project.workflowStatus === "COMPLETED" ? "green" : "yellow"}>{project.workflowStatus.replaceAll("_", " ")}</Badge></div><MemberProjectActions requestId={project.id} workflowStatus={project.workflowStatus} changeOrderId={project.changeOrders.find(order => order.status === "PENDING_HOMEOWNER")?.id} /></Card>)}
      </section>
    </div>
  );
}
