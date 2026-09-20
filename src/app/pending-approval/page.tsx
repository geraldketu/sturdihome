import { redirect } from "next/navigation";
import { getAuthenticatedSession, loginDestinationForRole } from "@/lib/auth";
import { accountGate } from "@/lib/approval";
import { safeReturnTo } from "@/lib/access";
import { Card } from "@/components/ui";
export default async function PendingApprovalPage() {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/login");
  const user = session.user;
  const gate = await accountGate(user);
  if (!gate) redirect(safeReturnTo(session.returnTo, user.role) ?? loginDestinationForRole(user.role));
  if (gate === "agreement") redirect("/agreement");
  if (gate === "cancelled") redirect("/account-cancelled");
  if (gate === "revoked") redirect("/account-revoked");
  const rejected = user.approvalStatus === "REJECTED";
  return <main className="mx-auto w-full max-w-lg px-4 py-16"><Card>
    <h1 className="text-xl font-bold text-brand-navy">{rejected ? "Application Not Approved" : "Application Under Review"}</h1>
    <p className="mt-3 text-sm leading-6 text-gray-600">{rejected ? "Please contact SturdiHome support if you have questions about your application." : "Your agreement is complete. An administrator must approve your account before you can use SturdiHome services. Check back here for your approval status."}</p>
    <a className="mt-5 inline-block text-brand underline" href="/pending-approval">Refresh status</a>
  </Card></main>;
}
