import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, NoticeBanner } from "@/components/ui";

export default async function MemberDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [documentCount, financingRequests, serviceRequests, appointments] = await Promise.all([
    prisma.document.count({ where: { userId: user.id } }),
    prisma.financingRequest.count({ where: { homeownerId: user.id } }),
    prisma.serviceRequest.count({ where: { homeownerId: user.id } }),
    prisma.appointment.count({ where: { homeownerId: user.id } }),
  ]);

  const agreementAccepted = Boolean(user.agreementAcceptedAt);

  const steps = [
    { label: "Create account", done: true },
    { label: "Sign member agreement", done: agreementAccepted, href: "/member/agreement" },
    { label: "Upload required documents", done: documentCount > 0, href: "/member/documents" },
  ];
  const remaining = steps.filter((s) => !s.done);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Welcome back, {user.name}</h1>
        <p className="text-sm text-gray-600">Here&apos;s what&apos;s happening with your SturdiHome account.</p>
      </div>

      <NoticeBanner>
        We&apos;re still building our network of vendors and financing partners, so none
        are live on the site yet. Any request you submit below will be held, and we&apos;ll
        reach out personally as soon as we have a qualified partner for you.
      </NoticeBanner>

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
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Documents</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{documentCount} uploaded</p>
          <Link href="/member/documents" className="mt-2 inline-block text-sm text-brand-dark hover:underline">
            Manage →
          </Link>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-gray-500">Service Requests</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{serviceRequests}</p>
          <Link href="/member/service-request" className="mt-2 inline-block text-sm text-brand-dark hover:underline">
            View / Submit →
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
          <p className="text-xs uppercase tracking-wide text-gray-500">Appointments</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{appointments} scheduled</p>
          <Link href="/member/appointments" className="mt-2 inline-block text-sm text-brand-dark hover:underline">
            View →
          </Link>
        </Card>
      </div>
    </div>
  );
}
