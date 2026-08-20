"use client";

import { useActionState } from "react";
import { updateLeadStatusAction } from "@/lib/actions/vendor-actions";
import { FormError } from "@/components/ui";

const STATUSES = ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELED"];

export default function LeadStatusForm({ requestId, currentStatus }: { requestId: string; currentStatus: string }) {
  const [state, formAction] = useActionState(updateLeadStatusAction, undefined);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="requestId" value={requestId} />
      <select
        name="status"
        defaultValue={currentStatus}
        className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-white hover:bg-gray-900"
      >
        Update
      </button>
      <FormError message={state?.error} />
    </form>
  );
}
