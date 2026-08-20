"use client";

import { useActionState } from "react";
import { submitServiceRequestAction } from "@/lib/actions/member-actions";
import { FormError, SubmitButton, TextArea } from "@/components/ui";

const SERVICE_TYPES = [
  "Roofing",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Windows & Doors",
  "Flooring",
  "Painting",
  "General Repair",
  "Other",
];

export default function ServiceRequestForm() {
  const [state, formAction] = useActionState(submitServiceRequestAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <label className="block text-sm font-medium text-gray-700">
        Service Type
        <select
          name="serviceType"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="">Select a service...</option>
          {SERVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <TextArea label="Description" name="description" required placeholder="Describe the work you need done" />
      <SubmitButton pendingText="Submitting...">Submit Service Request</SubmitButton>
    </form>
  );
}
