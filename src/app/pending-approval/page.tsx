import { redirect } from "next/navigation";
import { getSessionUser, loginDestinationForRole } from "@/lib/auth";
import { Card } from "@/components/ui";

export default async function PendingApprovalPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (user.role === "VENDOR" && user.vendorProfile?.status === "APPROVED") {
    redirect("/vendor");
  }
  if (user.role === "FINANCING_PARTNER" && user.financingProfile?.status === "APPROVED") {
    redirect("/financing");
  }
  if (user.role === "HOMEOWNER" || user.role === "ADMIN") {
    redirect(loginDestinationForRole(user.role));
  }

  const rejected =
    (user.role === "VENDOR" && user.vendorProfile?.status === "REJECTED") ||
    (user.role === "FINANCING_PARTNER" && user.financingProfile?.status === "REJECTED");

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <Card>
        {rejected ? (
          <>
            <h1 className="text-xl font-bold text-red-700">Application Not Approved</h1>
            <p className="mt-2 text-sm text-gray-600">
              Unfortunately your application was not approved. If you believe this is a
              mistake, please contact SturdiHome support.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-brand-dark">Application Under Review</h1>
            <p className="mt-2 text-sm text-gray-600">
              Thanks for applying! Our team is reviewing your application. You&apos;ll
              gain access to your dashboard as soon as you&apos;re approved.
            </p>
          </>
        )}
      </Card>
    </main>
  );
}
