"use client";

import { useActionState } from "react";
import { FormError, SubmitButton } from "@/components/ui";
import { lenderDecisionAction } from "@/lib/actions/project-actions";

export default function LenderDecisionForm({ financingRequestId, currentStatus, items }: { financingRequestId: string; currentStatus: string; items: { id: string; category: string; description: string; amountCents: number }[] }) {
  const [state, action] = useActionState(lenderDecisionAction, undefined);
  return <div className="mt-3 rounded border border-brand-gold/30 bg-brand-gold-pale/10 p-3 text-xs"><p className="font-semibold text-brand-navy">Project quote items</p><ul className="mt-1 space-y-1">{items.map(item => <li key={item.id}>{item.category}: {item.description} · ${(item.amountCents / 100).toFixed(2)}</li>)}</ul><form action={action} className="mt-2 flex items-center gap-2"><input type="hidden" name="financingRequestId" value={financingRequestId} /><select name="lenderStatus" defaultValue={currentStatus} className="rounded border p-1.5 text-gray-900"><option value="UNDER_REVIEW">Under Review</option><option value="ADDITIONAL_INFORMATION_NEEDED">Additional Information Needed</option><option value="APPROVED">Approved</option><option value="DECLINED">Declined</option></select><SubmitButton pendingText="Saving...">Save</SubmitButton></form><FormError message={state?.error} /></div>;
}