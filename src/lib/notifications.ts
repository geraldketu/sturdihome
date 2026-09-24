import "server-only";
import { prisma } from "@/lib/prisma";

export async function notifyUsers(userIds: string[], title: string, body: string) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (!uniqueIds.length) return;
  await prisma.userNotification.createMany({ data: uniqueIds.map(userId => ({ userId, title: title.slice(0, 160), body: body.slice(0, 4000) })) });
}

export async function ensureBirthdayNotification(user: { id: string; dateOfBirth: Date | null }) {
  if (!user.dateOfBirth) return;
  const now = new Date();
  if (user.dateOfBirth.getMonth() !== now.getMonth() || user.dateOfBirth.getDate() !== now.getDate()) return;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const existing = await prisma.userNotification.findFirst({ where: { userId: user.id, title: "Happy Birthday from SturdiHome Network!", createdAt: { gte: start } }, select: { id: true } });
  if (!existing) await prisma.userNotification.create({ data: { userId: user.id, title: "Happy Birthday from SturdiHome Network!", body: "We hope you have a wonderful birthday." } });
}
