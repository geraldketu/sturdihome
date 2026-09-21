"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui";
import { updateAppointmentAction } from "@/lib/actions/appointment-actions";

export default function AppointmentAdminForm({ appointmentId, status }: { appointmentId: string; status: string }) {
  const [, action] = useActionState(updateAppointmentAction, undefined);
  return <form action={action} className="mt-2 flex items-center gap-2"><input type="hidden" name="appointmentId" value={appointmentId} /><select name="status" defaultValue={status} className="rounded border p-1.5 text-xs text-gray-900"><option value="SCHEDULED">Scheduled</option><option value="COMPLETED">Completed</option><option value="CANCELED">Canceled</option></select><SubmitButton pendingText="Saving...">Update</SubmitButton></form>;
}
