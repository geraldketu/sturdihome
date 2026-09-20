"use client";
import { useActionState } from "react";
import { submitFinancingDisputeAction } from "@/lib/actions/financing-status-actions";
import { FormError, SubmitButton } from "@/components/ui";
export default function DisputeForm({ reportId, existing }: { reportId: string; existing?: string }) { const [state, action] = useActionState(submitFinancingDisputeAction, undefined); return <form action={action} className="mt-2 space-y-2"><input type="hidden" name="reportId" value={reportId} /><FormError message={state?.error} />{existing ? <p className="text-sm text-gray-600">Your response: {existing}</p> : <><textarea name="response" required maxLength={4000} placeholder="Explain the error or response" className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" /><SubmitButton pendingText="Sending...">Submit Dispute / Error Report</SubmitButton></>}</form>; }
