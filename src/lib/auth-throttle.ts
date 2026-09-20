import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

// Shared database buckets work across serverless instances; no raw emails/IPs stored.
export async function authRateLimited(scope: string, identifier: string, limit: number) {
  const windowMs = 15 * 60 * 1000;
  const bucket = Math.floor(Date.now() / windowMs);
  await prisma.authThrottle.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  const key = createHash("sha256").update(`${scope}:${bucket}:${identifier.toLowerCase()}`).digest("hex");
  const hit = await prisma.authThrottle.upsert({ where: { key },
    create: { key, expiresAt: new Date((bucket + 1) * windowMs) }, update: { count: { increment: 1 } },
  });
  return hit.count > limit;
}
