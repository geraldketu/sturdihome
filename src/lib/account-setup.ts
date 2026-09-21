import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendAccountSetupEmail } from "@/lib/reset-email";

export async function issueAccountSetupLink(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, passwordSetupRequired: true, approvalStatus: true } });
  if (!user || !user.passwordSetupRequired || user.approvalStatus !== "APPROVED") throw new Error("Account is not eligible for setup");
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await prisma.accountSetupToken.deleteMany({ where: { userId } });
  await prisma.accountSetupToken.create({ data: { tokenHash, userId, expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) } });
  await sendAccountSetupEmail(user.email, token);
}