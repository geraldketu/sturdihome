"use client";

import { useActionState } from "react";
import { submitFinancingRequestAction } from "@/lib/actions/member-actions";
import { Field, FormError, SubmitButton, TextArea } from "@/components/ui";

type PartnerOption = { id: string; companyName: string };

export default function FinancingRequestForm({ partners }: { partners: PartnerOption[] }) {
  const [state, formAction] = useActionState(submitFinancingRequestAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <TextArea
        label="Project Description"
        name="projectDescription"
        required
        placeholder="What are you looking to finance?"
      />
      <Field label="Amount Requested (USD)" name="amountRequested" type="number" required placeholder="15000" />

      <label className="block text-sm font-medium text-gray-700">
        Preferred Financing Partner (optional)
        <select
          name="partnerId"
          defaultValue=""
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="">No preference, let SturdiHome match me</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.companyName}
            </option>
          ))}
        </select>
        {partners.length === 0 && (
          <span className="mt-1 block text-xs text-gray-500">
            No financing partners are approved and active yet. We&apos;ll match you
            personally once one is.
          </span>
        )}
      </label>

      <SubmitButton pendingText="Submitting...">Submit Financing Request</SubmitButton>
    </form>
  );
}
