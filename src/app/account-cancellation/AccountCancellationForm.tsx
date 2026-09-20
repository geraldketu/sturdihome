"use client";
import { useActionState } from "react";
import { cancelAccountAction } from "@/lib/actions/account-actions";
import { FormError, SubmitButton } from "@/components/ui";
export default function AccountCancellationForm() {
  const [state, action] = useActionState(cancelAccountAction, undefined);
  return <form action={action} className="mt-6 space-y-4"><FormError message={state?.error} /><label className="block text-sm font-medium text-gray-700">Optional reason<textarea name="reason" maxLength={500} className="mt-1 min-h-24 w-full rounded-md border border-gray-300 px-3 py-2" /></label><label className="flex items-start gap-3 text-sm"><input type="checkbox" name="confirm" value="yes" required className="mt-1" />I understand cancellation disables my account and does not delete required records.</label><SubmitButton pendingText="Cancelling...">Confirm Cancellation</SubmitButton></form>;
}
