"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/auth-actions";

export async function acceptNetworkAgreement(_state: ActionState, form: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user || user.role === "ADMIN") return { error: "Sign in with your network account." };
  if (form.get("accepted") !== "yes") return { error: "Please confirm you have read and agree to the agreement." };
  if (form.get("electronicConsent") !== "yes") return { error: "Please consent to electronic records and electronic signatures." };
  const fullLegalName = String(form.get("fullLegalName") ?? "").trim();
  const electronicSignature = String(form.get("electronicSignature") ?? "").trim();
  const companyName = String(form.get("companyName") ?? "").trim();
  if (!fullLegalName || !electronicSignature || electronicSignature !== fullLegalName) return { error: "Enter your full legal name and type the same name as your electronic signature." };
  if ((user.role === "VENDOR" || user.role === "FINANCING_PARTNER") && !companyName) return { error: "Company name is required for this agreement." };
  const id = String(form.get("agreementId") ?? "");
  const accepted = await prisma.$transaction(async tx => {
    const currentUser = await tx.user.findUnique({ where: { id: user.id } });
    if (!currentUser || currentUser.role !== user.role) return false;
    const agreement = await tx.networkAgreement.findFirst({ where: { id, role: user.role, active: true } });
    if (!agreement) return false;
    // Repeated submissions cannot erase a completed admin review.
    const recorded = await tx.agreementAcceptance.findUnique({ where: { userId_role_version: { userId: user.id, role: user.role, version: agreement.version } } });
    if (!recorded) {
      const signedAt = new Date();
      const requestHeaders = await headers();
      const ipAddress = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? requestHeaders.get("x-real-ip");
      const userAgent = requestHeaders.get("user-agent");
      const signedCopyContent = `${agreement.content}\n\nSIGNED ELECTRONICALLY\n\nSigned By: ${fullLegalName}\nCompany: ${companyName || "N/A"}\nDate: ${signedAt.toLocaleDateString()}\nTime: ${signedAt.toLocaleTimeString()}\nAgreement: ${agreement.title}\nVersion: ${agreement.version}`;
      await tx.agreementAcceptance.create({ data: { userId: user.id, role: user.role, version: agreement.version, agreementType: agreement.role, agreementTitle: agreement.title, effectiveDate: agreement.effectiveDate, documentIdentifier: agreement.documentIdentifier, fullLegalName, companyName: companyName || null, electronicSignature, consentToElectronicRecords: true, signedCopyContent, ipAddress, userAgent, acceptedAt: signedAt } });
    }
    if (!recorded || currentUser.agreementVersion !== agreement.version || !currentUser.agreementAcceptedAt) {
      await tx.user.update({ where: { id: user.id }, data: { agreementAcceptedAt: new Date(), agreementVersion: agreement.version, approvalStatus: "PENDING", approvalReviewedAt: null, approvalReviewedBy: null } });
    }
    return true;
  }, { isolationLevel: "Serializable" });
  if (!accepted) return { error: "This agreement changed. Refresh and review the current version." };
  revalidatePath("/", "layout");
  redirect("/pending-approval");
}
