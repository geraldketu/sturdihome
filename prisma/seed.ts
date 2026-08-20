import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@sturdihome.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin account already exists:", email);
    return;
  }

  const passwordHash = await bcrypt.hash("Admin123!", 10);
  await prisma.user.create({
    data: {
      name: "SturdiHome Admin",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

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
