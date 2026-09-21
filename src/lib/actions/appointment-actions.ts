"use server";

import { revalidatePath } from "next/cache";
import { getApprovedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/auth-actions";
import { notifyUsers } from "@/lib/notifications";

export async function updateAppointmentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getApprovedUser();
  const id = String(formData.get("appointmentId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!user || !["SCHEDULED", "COMPLETED", "CANCELED"].includes(status)) return { error: "Not authorized." };
  const appointment = await prisma.appointment.findUnique({ where: { id }, include: { serviceRequest: true } });
  const owns = appointment?.homeownerId === user.id;
  const vendorOwns = user.role === "VENDOR" && appointment?.serviceRequest?.assignedVendorId === user.vendorProfile?.id;
  const admin = user.role === "ADMIN";
  if (!appointment || (!owns && !vendorOwns && !admin)) return { error: "Appointment not found." };
  await prisma.$transaction([prisma.appointment.update({ where: { id }, data: { status } }), ...(status === "COMPLETED" && appointment.serviceRequest ? [prisma.serviceRequest.update({ where: { id: appointment.serviceRequest.id }, data: { workflowStatus: "SITE_VISIT_COMPLETED", siteVisitCompletedAt: new Date() } })] : [])]);
  const notifyId = owns ? appointment.serviceRequest?.assignedVendorId : appointment.homeownerId;
  if (notifyId && typeof notifyId === "string") { const recipient = await prisma.user.findFirst({ where: { OR: [{ id: notifyId }, { vendorProfile: { id: notifyId } }] }, select: { id: true } }); if (recipient) await notifyUsers([recipient.id], "Appointment updated", `The site visit appointment was marked ${status.toLowerCase()}.`); }
  revalidatePath("/member/appointments"); revalidatePath("/vendor/leads"); revalidatePath("/admin/appointments");
}
