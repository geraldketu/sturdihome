import { approveAccountAction, rejectAccountAction, revokeAccessAction, setAccountAvailabilityAction } from "@/lib/actions/admin-actions";
import { prisma } from "@/lib/prisma";
import AdminApprovalActionForm from "@/components/AdminApprovalActionForm";

export default async function AdminAccountActions({ userId, approvalStatus, accountStatus }: { userId: string; approvalStatus: string; accountStatus: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, agreementAcceptedAt: true, agreementVersion: true } });
  const terms = user && await prisma.networkAgreement.findFirst({ where: { role: user.role, active: true }, select: { version: true } });
  const acceptance = user && terms && await prisma.agreementAcceptance.findUnique({ where: { userId_role_version: { userId, role: user.role, version: terms.version } }, select: { id: true } });
  const approvalReady = Boolean(terms && acceptance && user?.agreementAcceptedAt && user.agreementVersion === terms.version);
  if (accountStatus === "REVOKED") return <span className="text-xs font-medium text-red-700">Access revoked</span>;
  if (accountStatus === "PAUSED" || accountStatus === "SUSPENDED") return <div className="flex flex-wrap gap-2"><span className="text-xs font-medium text-red-700">{accountStatus}</span><form action={setAccountAvailabilityAction}><input type="hidden" name="userId" value={userId} /><input type="hidden" name="status" value="ACTIVE" /><button className="rounded border border-brand px-2 py-1 text-xs text-brand-dark">Reactivate</button></form></div>;
  if (approvalStatus === "PENDING") return <div className="space-y-2">
    <div className="flex flex-wrap gap-2">
      <AdminApprovalActionForm action={approveAccountAction} userId={userId} disabled={!approvalReady} label="Approve Account" />
    <form action={rejectAccountAction}>
      <input type="hidden" name="userId" value={userId} />
      <button className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">Reject Account</button>
    </form>
    </div>
    {!approvalReady && <p className="text-xs text-yellow-800">Approval is blocked until the applicant accepts the current network agreement.</p>}
  </div>;
  if (approvalStatus === "APPROVED") return <div className="flex flex-wrap gap-2"><form action={revokeAccessAction}><input type="hidden" name="userId" value={userId} /><button className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">Revoke Access</button></form><form action={setAccountAvailabilityAction}><input type="hidden" name="userId" value={userId} /><input type="hidden" name="status" value="PAUSED" /><button className="rounded border border-yellow-300 px-2 py-1 text-xs text-yellow-800">Pause</button></form><form action={setAccountAvailabilityAction}><input type="hidden" name="userId" value={userId} /><input type="hidden" name="status" value="SUSPENDED" /><button className="rounded border border-red-300 px-2 py-1 text-xs text-red-700">Suspend</button></form></div>;
  return null;
}
