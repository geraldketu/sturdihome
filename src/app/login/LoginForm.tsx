"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth-actions";
import { Field, FormError, SubmitButton } from "@/components/ui";

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <FormError message={state?.error} />
      <Field label="Email" name="email" type="email" required />
      <Field label="Password" name="password" type="password" required />
      <SubmitButton pendingText="Logging in...">Sign In</SubmitButton>
      <Link href="/forgot-password" className="block text-sm font-medium text-brand underline">Forgot Password?</Link>
      <p className="text-sm text-gray-600">
        Not a member yet?{" "}
        <Link href={next ? `/join-network?next=${encodeURIComponent(next)}` : "/join-network"} className="font-medium text-brand-dark hover:underline">
          Join SturdiHome
        </Link>
      </p>
    </form>
  );
}
