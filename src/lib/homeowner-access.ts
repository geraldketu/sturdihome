import "server-only";

import { prisma } from "@/lib/prisma";

export const HOMEOWNERSHIP_DOCUMENT_TYPES = [
  "PROPERTY_TAX_BILL",
  "MORTGAGE_STATEMENT",
  "HOMEOWNERS_INSURANCE_DECLARATION_PAGE",
  "DEED",
] as const;

export type HomeownershipDocumentType = (typeof HOMEOWNERSHIP_DOCUMENT_TYPES)[number];

export const HOMEOWNERSHIP_DOCUMENT_LABELS: Record<HomeownershipDocumentType, string> = {
  PROPERTY_TAX_BILL: "Property tax bill",
  MORTGAGE_STATEMENT: "Mortgage statement",
  HOMEOWNERS_INSURANCE_DECLARATION_PAGE: "Homeowners insurance declaration page",
  DEED: "Deed",
};

export function isHomeownerVerified(user: { role: string; homeownerAccountType?: string; homeownerVerificationStatus?: string }) {
  return user.role === "ADMIN" || (user.role === "HOMEOWNER" && user.homeownerAccountType === "VERIFIED_HOMEOWNER" && user.homeownerVerificationStatus === "VERIFIED");
}

export async function hasHomeownerVerification(userId: string) {
  const document = await prisma.document.findFirst({
    where: { userId, documentType: { in: [...HOMEOWNERSHIP_DOCUMENT_TYPES] } },
    select: { id: true },
  });
  return Boolean(document);
}

export function isHomeownershipDocumentType(value: unknown): value is HomeownershipDocumentType {
  return typeof value === "string" && HOMEOWNERSHIP_DOCUMENT_TYPES.includes(value as HomeownershipDocumentType);
}
