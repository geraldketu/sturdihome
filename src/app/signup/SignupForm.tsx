"use client";

import { useActionState } from "react";
import { signupAction } from "@/lib/actions/auth-actions";
import { Field, FormError, SubmitButton } from "@/components/ui";

export default function SignupForm() {
  const [state, formAction] = useActionState(signupAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <Field label="Full Name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone" name="phone" type="tel" />
      <Field label="Password" name="password" type="password" required placeholder="At least 8 characters" />
      <SubmitButton pendingText="Creating account...">Create Account</SubmitButton>
    </form>
  );
}
