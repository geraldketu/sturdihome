import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AGREEMENTS, AGREEMENT_EFFECTIVE_DATE, AGREEMENT_VERSION } from "../src/lib/agreement-content";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@sturdihome.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("Admin123!", 10);
    await prisma.user.create({ data: { name: "SturdiHome Admin", email, passwordHash, role: "ADMIN" } });
  }
  for (const role of ["HOMEOWNER", "VENDOR", "FINANCING_PARTNER"] as const) {
    const agreement = AGREEMENTS[role];
    await prisma.networkAgreement.upsert({
      where: { role_version: { role, version: AGREEMENT_VERSION } },
      update: { title: agreement.title, content: agreement.content, effectiveDate: new Date(AGREEMENT_EFFECTIVE_DATE), documentIdentifier: agreement.documentIdentifier, active: true },
      create: { role, version: AGREEMENT_VERSION, title: agreement.title, content: agreement.content, effectiveDate: new Date(AGREEMENT_EFFECTIVE_DATE), documentIdentifier: agreement.documentIdentifier, active: true },
    });
  }
  for (const role of ["HOMEOWNER", "VENDOR", "FINANCING_PARTNER"] as const) {
    await prisma.networkAgreement.updateMany({ where: { role, version: { not: AGREEMENT_VERSION } }, data: { active: false } });
  }

  console.log("Created admin account:");
  console.log("  email:", email);
  console.log("  password: Admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
