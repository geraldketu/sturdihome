"use client";

import { useActionState } from "react";
import { SubmitButton, FormError } from "@/components/ui";
import { adminCompleteProjectAction } from "@/lib/actions/project-actions";

export default function ProjectOverrideForm({ requestId }: { requestId: string }) {
  const [state, action] = useActionState(adminCompleteProjectAction, undefined);
  return <form action={action} className="mt-3 flex gap-2"><input type="hidden" name="requestId" value={requestId} /><input name="reason" required placeholder="Admin completion override reason" className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1.5 text-xs" /><SubmitButton pendingText="Closing...">Admin Override Complete</SubmitButton><FormError message={state?.error} /></form>;
}
