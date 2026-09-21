"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/auth-actions";

export async function markNotificationReadAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getSessionUser();
  const id = String(formData.get("notificationId") ?? "");
  if (!user || !id) return { error: "Not authorized." };
  await prisma.userNotification.updateMany({ where: { id, userId: user.id }, data: { readAt: new Date() } });
  revalidatePath("/notifications");
}
