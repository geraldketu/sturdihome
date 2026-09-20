"use client";
import { useActionState } from "react";
import { requestPasswordReset, resetPassword } from "@/lib/actions/password-actions";
import { Field, FormError, SubmitButton } from "@/components/ui";

export default function PasswordForm({ token }: { token?: string }) {
  const [state, action] = useActionState(token === undefined ? requestPasswordReset : resetPassword, undefined);
  return <form action={action} className="space-y-4">
    <FormError message={state?.error} />
    {state?.success && <p role="status" className="rounded-md bg-green-50 p-3 text-sm text-brand">{state.success}</p>}
    {token === undefined ? <Field label="Email" name="email" type="email" required /> : <>
      <input type="hidden" name="token" value={token} />
      <Field label="New password" name="password" type="password" required placeholder="At least 8 characters" />
      <Field label="Confirm password" name="confirm" type="password" required />
    </>}
    <SubmitButton pendingText="Please wait…">{token === undefined ? "Send reset link" : "Reset password"}</SubmitButton>
  </form>;
}
