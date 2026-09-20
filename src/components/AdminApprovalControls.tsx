import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/auth";
import AdminAccountActions from "@/components/AdminAccountActions";

export default async function AdminApprovalControls({ userId }: { userId: string }) {
  await requirePageAccess("/admin");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "ADMIN") return null;
  const terms = await prisma.networkAgreement.findFirst({ where: { role: user.role, active: true } });
  const acceptance = terms && await prisma.agreementAcceptance.findUnique({ where: { userId_role_version: { userId, role: user.role, version: terms.version } } });
  const accepted = !!acceptance && !!terms && !!user.agreementAcceptedAt && user.agreementVersion === terms.version;
  return <section className="rounded-lg border border-gray-200 bg-white p-5">
    <h2 className="font-semibold text-brand-navy">Network Access Approval</h2>
    <p className="my-3 text-sm">Agreement: {accepted ? `Accepted (${user.agreementVersion})` : "Current agreement not accepted"}. Application: {user.approvalStatus}. Access: {user.accountStatus}.</p>
    {!terms && <p className="mb-3 text-sm text-gray-600">Approved agreement not yet available. Approval is blocked.</p>}
    <AdminAccountActions userId={user.id} approvalStatus={user.approvalStatus} accountStatus={user.accountStatus} approvalReady={accepted} />
  </section>;
}
