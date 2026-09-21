"use client";

import { useActionState } from "react";
import { FormError, SubmitButton } from "@/components/ui";
import { acceptFinalQuoteAction, approveChangeOrderAction, confirmServiceCompletionAction } from "@/lib/actions/member-actions";

export default function MemberProjectActions({ requestId, workflowStatus, changeOrderId }: { requestId: string; workflowStatus: string; changeOrderId?: string }) {
  const [quoteState, quoteAction] = useActionState(acceptFinalQuoteAction, undefined);
  const [completionState, completionAction] = useActionState(confirmServiceCompletionAction, undefined);
  const [changeState, changeAction] = useActionState(approveChangeOrderAction, undefined);
  return <div className="mt-3 space-y-2"><FormError message={quoteState?.error || completionState?.error || changeState?.error} />{workflowStatus === "FINAL_QUOTE_SUBMITTED" && <form action={quoteAction}><input type="hidden" name="requestId" value={requestId} /><SubmitButton pendingText="Accepting...">Accept Final Quote</SubmitButton></form>}{changeOrderId && <form action={changeAction}><input type="hidden" name="changeOrderId" value={changeOrderId} /><SubmitButton pendingText="Approving...">Approve Change Order</SubmitButton></form>}{workflowStatus === "AWAITING_HOMEOWNER_CONFIRMATION" && <form action={completionAction}><input type="hidden" name="requestId" value={requestId} /><SubmitButton pendingText="Confirming...">Confirm Completion</SubmitButton></form>}</div>;
}
