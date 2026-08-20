"use client";

import { useActionState } from "react";
import { submitFinancingRequestAction } from "@/lib/actions/member-actions";
import { Field, FormError, SubmitButton, TextArea } from "@/components/ui";

export default function FinancingRequestForm() {
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
      <SubmitButton pendingText="Submitting...">Submit Financing Request</SubmitButton>
    </form>
  );
}
