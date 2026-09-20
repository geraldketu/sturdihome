import { approveAccountAction, rejectAccountAction, revokeAccessAction } from "@/lib/actions/admin-actions";

export default function AdminAccountActions({ userId, approvalStatus, accountStatus, approvalReady = true }: { userId: string; approvalStatus: string; accountStatus: string; approvalReady?: boolean }) {
  if (accountStatus === "REVOKED") return <span className="text-xs font-medium text-red-700">Access revoked</span>;
  if (approvalStatus === "PENDING") return <div className="flex flex-wrap gap-2">
    <form action={approveAccountAction}>
      <input type="hidden" name="userId" value={userId} />
      <button disabled={!approvalReady} className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40">Approve Account</button>
    </form>
    <form action={rejectAccountAction}>
      <input type="hidden" name="userId" value={userId} />
      <button className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">Reject Account</button>
    </form>
  </div>;
  if (approvalStatus === "APPROVED") return <form action={revokeAccessAction}>
    <input type="hidden" name="userId" value={userId} />
    <button className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">Revoke Access</button>
  </form>;
  return null;
}
