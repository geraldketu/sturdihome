import "server-only";
import { prisma } from "@/lib/prisma";
import type { Role, ApplicationStatus } from "@prisma/client";

export async function reviewAccount(adminId: string, userId: string, role: Role, status: ApplicationStatus) {
  return prisma.$transaction(async tx => {
    const admin = await tx.user.findUnique({ where: { id: adminId } });
    if (admin?.role !== "ADMIN") throw new Error("Not authorized");
    const user = await tx.user.findFirst({ where: { id: userId, role } });
    if (!user || role === "ADMIN") throw new Error("Invalid account");
    if (status === "APPROVED") {
      const terms = await tx.networkAgreement.findFirst({ where: { role, active: true } });
      const acceptance = terms && await tx.agreementAcceptance.findUnique({ where: { userId_role_version: { userId, role, version: terms.version } } });
      if (!terms || !acceptance || !user.agreementAcceptedAt || user.agreementVersion !== terms.version) throw new Error("Current agreement must be accepted before approval");
    }
    const reviewedAt = new Date();
    await tx.user.update({ where: { id: userId }, data: { approvalStatus: status, approvalReviewedAt: reviewedAt, approvalReviewedBy: adminId } });
    if (role === "VENDOR") await tx.vendorProfile.update({ where: { userId }, data: { status, reviewedAt } });
    if (role === "FINANCING_PARTNER") await tx.financingPartnerProfile.update({ where: { userId }, data: { status, reviewedAt } });
    await tx.approvalAudit.create({ data: { userId, adminId, status } });
    // No session rewrite needed: every protected operation reads the current gate.
  }, { isolationLevel: "Serializable" });
}

export async function revokeAccount(adminId: string, userId: string) {
  return prisma.$transaction(async tx => {
    const admin = await tx.user.findUnique({ where: { id: adminId }, select: { role: true } });
    if (admin?.role !== "ADMIN") throw new Error("Not authorized");
    const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true, role: true, accountStatus: true } });
    if (!user || user.role === "ADMIN") throw new Error("Invalid account");
    if (user.accountStatus === "REVOKED") return;
    await tx.user.update({ where: { id: userId }, data: { accountStatus: "REVOKED" } });
    await tx.adminAccountActionAudit.create({ data: { userId, adminId, action: "REVOKE_ACCESS" } });
  }, { isolationLevel: "Serializable" });
}
