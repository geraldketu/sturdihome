"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui";
import { markNotificationReadAction } from "@/lib/actions/notification-actions";

export default function NotificationReadForm({ notificationId }: { notificationId: string }) {
  const [, action] = useActionState(markNotificationReadAction, undefined);
  return <form action={action}><input type="hidden" name="notificationId" value={notificationId} /><SubmitButton pendingText="Saving...">Mark read</SubmitButton></form>;
}