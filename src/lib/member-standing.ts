import "server-only";
import { prisma } from "@/lib/prisma";

export const MEMBER_STANDING_VERSION = "1.0";
export const MEMBER_STANDING_EFFECTIVE_DATE = new Date("2026-09-19T00:00:00.000Z");
export const MEMBER_STANDING_DOCUMENT_ID = "member-account-standing-platform-access-v1.0";
export const MEMBER_STANDING_TITLE = "Member Account Standing and Platform Access Agreement";
export const MEMBER_STANDING_CONTENT = `MEMBER ACCOUNT STANDING AND PLATFORM ACCESS AGREEMENT
Effective Date: September 19, 2026
Version: 1.0

SturdiHome Network LLC is a referral and network platform. SturdiHome is not the homeowner's lender, creditor, debt collector, collection agency, or credit bureau. Financing agreements and repayment obligations are directly between the homeowner and the participating finance partner. SturdiHome does not collect loan payments or accept repayment for a finance partner.

A participating finance partner may report to SturdiHome that a financing account connected to the platform has a payment problem, delinquency, resolution, closure, or reporting error. If a report is received, SturdiHome may review it and temporarily restrict the homeowner's access to new financing referrals through SturdiHome. SturdiHome does not independently determine that a debt is legally owed merely because a finance partner submits a report.

SturdiHome will provide notice of a reported issue, identify the reporting finance partner, provide a way to dispute or report an error, and explain that questions about the underlying balance, payment history, or financing agreement must be addressed with the reporting finance partner. A report does not automatically cancel the member account. Long-term restrictions require SturdiHome review under its approved policy.

Material changes to this Agreement require a new electronic acceptance. The signed electronic record and exact accepted copy are preserved in the member's documents area.`;

export async function getMemberStandingAcceptance(userId: string) {
  return prisma.memberStandingAcceptance.findUnique({ where: { userId_version: { userId, version: MEMBER_STANDING_VERSION } } });
}

export async function hasMemberStandingAccess(userId: string) {
  return Boolean(await getMemberStandingAcceptance(userId));
}