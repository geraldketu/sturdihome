import "server-only";
import { prisma } from "@/lib/prisma";

export async function notifyUsers(userIds: string[], title: string, body: string) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (!uniqueIds.length) return;
  await prisma.userNotification.createMany({ data: uniqueIds.map(userId => ({ userId, title: title.slice(0, 160), body: body.slice(0, 4000) })) });
}
