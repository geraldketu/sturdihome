"use client";

import { useActionState } from "react";
import { setServiceRequestPriceAction } from "@/lib/actions/vendor-actions";
import { FormError } from "@/components/ui";

export default function SetPriceForm({ requestId, priceCents }: { requestId: string; priceCents: number | null }) {
  const [state, formAction] = useActionState(setServiceRequestPriceAction, undefined);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="requestId" value={requestId} />
      <label className="flex items-center gap-1 text-xs text-gray-600">
        $
        <input
          type="number"
          name="priceDollars"
          min="1"
          step="1"
          defaultValue={priceCents ? priceCents / 100 : undefined}
          placeholder="Price"
          className="w-20 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-900"
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-white hover:bg-gray-900"
      >
        {priceCents ? "Update Price" : "Request Payment"}
      </button>
      <FormError message={state?.error} />
    </form>
  );
}
