"use client";

import { useActionState } from "react";
import { applyFinancingAction } from "@/lib/actions/auth-actions";
import { Field, FormError, SubmitButton, TextArea } from "@/components/ui";

export default function FinancingApplicationForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(applyFinancingAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <FormError message={state?.error} />
      <Field label="Contact Name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone" name="phone" type="tel" />
      <Field label="Company Name" name="companyName" required />
      <TextArea
        label="License / Accreditation Info"
        name="licenseInfo"
        required
        placeholder="License number, issuing state, NMLS ID, etc."
      />
      <SubmitButton pendingText="Submitting...">Submit Application</SubmitButton>
    </form>
  );
}
