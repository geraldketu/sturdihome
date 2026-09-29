"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/auth-actions";

type ApprovalAction = (formData: FormData) => Promise<void>;

export default function AdminApprovalActionForm({ action, userId, disabled, label }: { action: ApprovalAction; userId: string; disabled: boolean; label: string }) {
  const [error, submitAction, pending] = useActionState(async (_previous: ActionState | undefined, formData: FormData) => {
    try {
      await action(formData);
      return undefined;
    } catch (caught) {
      return { error: caught instanceof Error ? caught.message : "The approval could not be completed." };
    }
  }, undefined);

  return <div>
    <form action={submitAction}>
      <input type="hidden" name="userId" value={userId} />
      <button disabled={disabled || pending} className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40">{pending ? "Saving..." : label}</button>
    </form>
    {error?.error && <p className="mt-1 max-w-xs text-xs text-red-700">{error.error}</p>}
  </div>;
}