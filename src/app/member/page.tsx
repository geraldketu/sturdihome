import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";

export default async function MemberDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [documentCount, financingRequests, serviceRequests, appointments] = await Promise.all([
    prisma.document.count({ where: { userId: user.id } }),
    prisma.financingRequest.count({ where: { homeownerId: user.id } }),
    prisma.serviceRequest.count({ where: { homeownerId: user.id } }),
    prisma.appointment.count({ where: { homeownerId: user.id } }),
  ]);

  const membershipActive = user.membership?.status === "ACTIVE";
  const agreementAccepted = Boolean(user.agreementAcceptedAt);

  const steps = [
    { label: "Create account", done: true },
    { label: "Activate membership", done: membershipActive, href: "/member/membership" },
    { label: "Sign member agreement", done: agreementAccepted, href: "/member/agreement" },
    { label: "Upload required documents", done: documentCount > 0, href: "/member/documents" },
  ];
  const remaining = steps.filter((s) => !s.done);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Welcome back, {user.name}</h1>
        <p className="text-sm text-gray-600">Here&apos;s what&apos;s happening with your SturdiHome membership.</p>
      </div>

      {remaining.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <h2 className="font-semibold text-yellow-900">Finish setting up your membership</h2>
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Membership</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {user.membership?.status ?? "NONE"}
          </p>
          <Link href="/member/membership" className="mt-2 inline-block text-sm text-brand-dark hover:underline">
            Manage →
          </Link>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Financing Requests</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{financingRequests}</p>
          <Link href="/member/financing-request" className="mt-2 inline-block text-sm text-brand-dark hover:underline">
            View / Submit →
          </Link>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Service Requests</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{serviceRequests}</p>
          <Link href="/member/service-request" className="mt-2 inline-block text-sm text-brand-dark hover:underline">
            View / Submit →
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Appointments</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{appointments} scheduled</p>
          <Link href="/member/appointments" className="mt-2 inline-block text-sm text-brand-dark hover:underline">
            View →
          </Link>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Documents</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{documentCount} uploaded</p>
          <Link href="/member/documents" className="mt-2 inline-block text-sm text-brand-dark hover:underline">
            Manage →
          </Link>
        </Card>
      </div>
    </div>
  );
}
