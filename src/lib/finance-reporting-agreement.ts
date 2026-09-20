import "server-only";
import { prisma } from "@/lib/prisma";
import { FINANCE_REPORTING_VERSION } from "@/lib/finance-reporting-config";
import { syntheticQuery } from "@/lib/task4-test-db";

export async function hasFinanceReportingAcceptance(userId: string) {
  if (process.env.SYNTHETIC_TEST_DB === "true" || process.env.DATABASE_URL?.includes("127.0.0.1:55439")) {
    const rows = await syntheticQuery<{ id: string }>('SELECT "id" FROM "FinancePartnerReportingAcceptance" WHERE "userId"=$1 AND "version"=$2 LIMIT 1', [userId, FINANCE_REPORTING_VERSION]);
    return rows.length > 0;
  }
  return Boolean(await prisma.financePartnerReportingAcceptance.findUnique({ where: { userId_version: { userId, version: FINANCE_REPORTING_VERSION } } }));
}
