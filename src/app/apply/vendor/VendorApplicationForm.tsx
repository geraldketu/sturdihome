"use client";

import { useActionState } from "react";
import { applyVendorAction } from "@/lib/actions/auth-actions";
import { Field, FormError, SubmitButton, TextArea } from "@/components/ui";

export default function VendorApplicationForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(applyVendorAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <FormError message={state?.error} />
      <Field label="Contact Name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone" name="phone" type="tel" />
      <Field label="Company Name" name="companyName" required />
      <Field label="Service Area" name="serviceArea" required placeholder="e.g. Baltimore County, MD" />
      <TextArea
        label="Services Offered"
        name="servicesOffered"
        required
        placeholder="e.g. Roofing, HVAC, plumbing..."
      />
      <SubmitButton pendingText="Submitting...">Submit Application</SubmitButton>
    </form>
  );
}
