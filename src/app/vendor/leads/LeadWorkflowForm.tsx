"use client";

import { useActionState } from "react";
import { FormError, SubmitButton } from "@/components/ui";
import { markVendorCompleteAction, respondToServiceRequestAction, scheduleSiteVisitAction, submitFinalQuoteAction } from "@/lib/actions/vendor-actions";
import { completeSiteVisitAction, createChangeOrderAction } from "@/lib/actions/project-actions";

export default function LeadWorkflowForm({ requestId, workflowStatus }: { requestId: string; workflowStatus: string }) {
  const [response, responseAction] = useActionState(respondToServiceRequestAction, undefined);
  const [schedule, scheduleAction] = useActionState(scheduleSiteVisitAction, undefined);
  const [quote, quoteAction] = useActionState(submitFinalQuoteAction, undefined);
  const [complete, completeAction] = useActionState(markVendorCompleteAction, undefined);
  const [visit, visitAction] = useActionState(completeSiteVisitAction, undefined);
  const [change, changeAction] = useActionState(createChangeOrderAction, undefined);
  return <div className="space-y-3 rounded-md border border-brand-gold/30 bg-brand-gold-pale/10 p-3 text-xs">
    <FormError message={response?.error || schedule?.error || quote?.error || complete?.error || visit?.error || change?.error} />
    {workflowStatus === "ESTIMATE_SUBMITTED" || workflowStatus === "ASSIGNED" ? <form action={responseAction} className="flex gap-2"><input type="hidden" name="requestId" value={requestId} /><button name="decision" value="ACCEPT" className="rounded bg-brand px-3 py-1.5 font-semibold text-white">Accept</button><button name="decision" value="DECLINE" className="rounded border border-red-300 px-3 py-1.5 font-semibold text-red-700">Decline</button></form> : null}
    {workflowStatus === "VENDOR_ACCEPTED" ? <form action={scheduleAction} className="flex items-center gap-2"><input type="hidden" name="requestId" value={requestId} /><label className="flex-1">Site visit<input name="scheduledFor" type="datetime-local" required className="mt-1 block w-full rounded border border-gray-300 p-1.5 text-gray-900" /></label><SubmitButton pendingText="Scheduling...">Schedule</SubmitButton></form> : null}
    {workflowStatus === "SITE_VISIT_SCHEDULED" || workflowStatus === "SITE_VISIT_COMPLETED" ? <form action={quoteAction} className="space-y-2"><input type="hidden" name="requestId" value={requestId} /><p className="font-semibold text-brand-navy">Final itemized quote</p><div className="grid grid-cols-3 gap-1"><input name="category" placeholder="Labor" required className="rounded border p-1.5" /><input name="description" placeholder="Description" required className="rounded border p-1.5" /><input name="amountCents" type="number" min="0" placeholder="Cents" required className="rounded border p-1.5" /></div><SubmitButton pendingText="Submitting...">Submit Quote</SubmitButton></form> : null}
    {workflowStatus === "SITE_VISIT_SCHEDULED" ? <form action={visitAction}><input type="hidden" name="requestId" value={requestId} /><SubmitButton pendingText="Updating...">Mark Site Visit Complete</SubmitButton></form> : null}
    {workflowStatus === "HOMEOWNER_ACCEPTED" || workflowStatus === "FINANCING_APPROVED" || workflowStatus === "WORK_IN_PROGRESS" || workflowStatus === "JOB_AUTHORIZED" ? <form action={changeAction} className="space-y-2"><input type="hidden" name="requestId" value={requestId} /><input name="requestedAmountCents" type="number" min="0" required placeholder="New total in cents" className="w-full rounded border p-1.5" /><input name="reason" required placeholder="Change-order reason" className="w-full rounded border p-1.5" /><SubmitButton pendingText="Submitting...">Submit Change Order</SubmitButton></form> : null}
    {workflowStatus === "HOMEOWNER_ACCEPTED" || workflowStatus === "FINANCING_APPROVED" || workflowStatus === "WORK_IN_PROGRESS" || workflowStatus === "JOB_AUTHORIZED" ? <form action={completeAction}><input type="hidden" name="requestId" value={requestId} /><SubmitButton pendingText="Updating...">Mark Job Complete</SubmitButton></form> : null}
  </div>;
}