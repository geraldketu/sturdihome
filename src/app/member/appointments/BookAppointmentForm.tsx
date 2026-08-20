"use client";

import { useActionState } from "react";
import { bookAppointmentAction } from "@/lib/actions/member-actions";
import { FormError, SubmitButton } from "@/components/ui";

type ServiceRequestOption = { id: string; serviceType: string; description: string };

export default function BookAppointmentForm({ requests }: { requests: ServiceRequestOption[] }) {
  const [state, formAction] = useActionState(bookAppointmentAction, undefined);

  if (requests.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Submit a home-service request first before booking an appointment.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <label className="block text-sm font-medium text-gray-700">
        Service Request
        <select
          name="serviceRequestId"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="">Select a service request...</option>
          {requests.map((req) => (
            <option key={req.id} value={req.id}>
              {req.serviceType} — {req.description.slice(0, 40)}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Date &amp; Time
        <input
          type="datetime-local"
          name="scheduledFor"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </label>
      <SubmitButton pendingText="Booking...">Book Appointment</SubmitButton>
    </form>
  );
}
