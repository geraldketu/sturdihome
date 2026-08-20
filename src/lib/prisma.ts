import { PrismaClient } from "@prisma/client";
import fs from "fs";
import bcrypt from "bcryptjs";
import { SCHEMA_SQL } from "@/lib/schema.sql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Vercel's serverless filesystem is ephemeral and read-only outside /tmp, so the
// checked-in SQLite file can't be written to at runtime. On Vercel we run against a
// fresh database in /tmp instead, and bootstrap its schema + a seed admin account the
// first time each cold-started instance sees it. Data does not persist across
// deployments or new instances -- this is a demo affordance, not real persistence.
const TMP_DB_PATH = "/tmp/sturdihome.db";
const isVercel = Boolean(process.env.VERCEL);

async function bootstrapTmpDatabase(client: PrismaClient) {
  if (fs.existsSync(TMP_DB_PATH)) return;

  const statements = SCHEMA_SQL.split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await client.$executeRawUnsafe(statement);
  }

  const passwordHash = await bcrypt.hash("Admin123!", 10);
  await client.user.create({
    data: {
      name: "SturdiHome Admin",
      email: "admin@sturdihome.com",
      passwordHash,
      role: "ADMIN",
    },
  });
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(isVercel ? { datasources: { db: { url: `file:${TMP_DB_PATH}` } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (isVercel) {
  await bootstrapTmpDatabase(prisma);
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
