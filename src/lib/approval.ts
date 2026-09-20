import "server-only";
import { prisma } from "@/lib/prisma";

type Account = { id: string; role: string; approvalStatus: string; agreementAcceptedAt: Date | null; agreementVersion: string | null; homeownerAccountType?: string;
  vendorProfile?: { status: string } | null; financingProfile?: { status: string } | null };

export async function accountGate(user: Account): Promise<"agreement" | "approval" | "cancelled" | "revoked" | null> {
  if (user.role === "ADMIN") return null;
  if ((user as Account & { accountStatus?: string }).accountStatus === "CANCELLED") return "cancelled";
  if ((user as Account & { accountStatus?: string }).accountStatus === "REVOKED") return "revoked";
  const agreement = await prisma.networkAgreement.findFirst({ where: { role: user.role as "HOMEOWNER" | "VENDOR" | "FINANCING_PARTNER", active: true } });
  if (!agreement || !user.agreementAcceptedAt || user.agreementVersion !== agreement.version) return "agreement";
  const acceptance = await prisma.agreementAcceptance.findUnique({ where: { userId_role_version: { userId: user.id, role: agreement.role, version: agreement.version } } });
  if (!acceptance) return "agreement";
  if (user.role === "HOMEOWNER" && user.homeownerAccountType === "SERVICE_ONLY") return null;
  if (user.approvalStatus !== "APPROVED") return "approval";
  if (user.role === "VENDOR" && user.vendorProfile?.status !== "APPROVED") return "approval";
  if (user.role === "FINANCING_PARTNER" && user.financingProfile?.status !== "APPROVED") return "approval";
  return null;
}

// Shared selection rule: inactive agreements remove partners from discovery too.
export async function approvedAccountWhere(role: "VENDOR" | "FINANCING_PARTNER") {
  const agreement = await prisma.networkAgreement.findFirst({ where: { role, active: true } });
  return { role, approvalStatus: "APPROVED" as const, agreementAcceptedAt: { not: null },
    agreementVersion: agreement?.version ?? "__NO_APPROVED_AGREEMENT__",
    agreementAcceptances: { some: { role, version: agreement?.version ?? "__NO_APPROVED_AGREEMENT__" } },
    ...(agreement ? {} : { id: { in: [] as string[] } }) };
}
