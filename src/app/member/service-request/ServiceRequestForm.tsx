"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { submitServiceRequestAction } from "@/lib/actions/member-actions";
import { FormError, SubmitButton, TextArea } from "@/components/ui";
import {
  SERVICE_TYPES,
  SCOPE_OPTIONS,
  URGENCY_OPTIONS,
  isSizeSensitive,
  calculateEstimate,
  type Scope,
  type Urgency,
} from "@/lib/estimator";
import { formatCentsRange } from "@/lib/format";

export default function ServiceRequestForm() {
  const [state, formAction] = useActionState(submitServiceRequestAction, undefined);
  const [serviceType, setServiceType] = useState("");
  const [scope, setScope] = useState<Scope>("standard");
  const [urgency, setUrgency] = useState<Urgency>("standard");
  const [squareFootage, setSquareFootage] = useState("");

  const sizeSensitive = isSizeSensitive(serviceType);

  const estimate = useMemo(() => {
    if (!serviceType) return null;
    return calculateEstimate({
      serviceType,
      scope,
      urgency,
      squareFootage: sizeSensitive ? Number(squareFootage) || undefined : undefined,
    });
  }, [serviceType, scope, urgency, squareFootage, sizeSensitive]);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <label className="block text-sm font-medium text-gray-700">
        Service Type
        <select
          name="serviceType"
          required
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
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

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-gray-700">
          Project Scope
          <select
            name="scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as Scope)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {SCOPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Timing
          <select
            name="urgency"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as Urgency)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          >
            {URGENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {sizeSensitive && (
        <label className="block text-sm font-medium text-gray-700">
          Approximate Square Footage
          <input
            type="number"
            name="squareFootage"
            min="1"
            step="1"
            value={squareFootage}
            onChange={(e) => setSquareFootage(e.target.value)}
            placeholder="e.g. 1500"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </label>
      )}

      {estimate && (
        <div className="rounded-md border border-brand-gold/40 bg-brand-gold-pale/50 px-4 py-3">
          <p className="text-sm font-semibold text-brand-navy">
            Estimated cost: {formatCentsRange(estimate.lowCents, estimate.highCents)}
          </p>
          <p className="mt-1 text-xs text-brand-navy/80">
            Ballpark estimate only &mdash; your matched vendor sets the final price after
            reviewing the job.
          </p>
        </div>
      )}

      <TextArea label="Description" name="description" required placeholder="Describe the work you need done" />
      <SubmitButton pendingText="Submitting...">Submit Service Request</SubmitButton>
    </form>
  );
}
