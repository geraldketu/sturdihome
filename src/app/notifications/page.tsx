import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import NotificationReadForm from "./NotificationReadForm";

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const notifications = await prisma.userNotification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return <main className="mx-auto max-w-3xl space-y-6 px-4 py-12"><div><h1 className="text-2xl font-bold text-brand-dark">Notifications</h1><p className="text-sm text-gray-600">Updates about your applications, projects, appointments, quotes, and financing.</p></div>{notifications.length === 0 ? <Card><p className="text-sm text-gray-500">No notifications yet.</p></Card> : notifications.map(note => <Card key={note.id} className={note.readAt ? "opacity-70" : "border-brand-gold/50"}><p className="font-semibold text-brand-navy">{note.title}</p><p className="mt-1 text-sm text-gray-600">{note.body}</p><p className="mt-2 text-xs text-gray-500">{note.createdAt.toLocaleString()}</p>{!note.readAt && <div className="mt-2"><NotificationReadForm notificationId={note.id} /></div>}</Card>)}</main>;
}
