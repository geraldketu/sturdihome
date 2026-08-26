"use client";

import { useActionState } from "react";
import { createServicePaymentCheckoutAction } from "@/lib/actions/billing-actions";
import { FormError, SubmitButton } from "@/components/ui";

export default function PayButton({ requestId, priceCents }: { requestId: string; priceCents: number }) {
  const [state, formAction] = useActionState(createServicePaymentCheckoutAction, undefined);

  return (
    <form action={formAction} className="mt-2">
      <input type="hidden" name="requestId" value={requestId} />
      <FormError message={state?.error} />
      <SubmitButton pendingText="Redirecting...">Pay ${(priceCents / 100).toFixed(2)} Now</SubmitButton>
    </form>
  );
}
