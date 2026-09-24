"use client";

import { useActionState } from "react";
import { FormError, SubmitButton } from "@/components/ui";
import { deleteDocumentAction, reviewDocumentAction, sendDocumentAction } from "@/lib/actions/admin-document-actions";

export default function DocumentAdminActions({ documentId, email, label }: { documentId: string; email: string; label: string }) {
  const [reviewState, reviewAction] = useActionState(reviewDocumentAction, undefined);
  const [sendState, sendAction] = useActionState(sendDocumentAction, undefined);
  const [deleteState, deleteAction] = useActionState(deleteDocumentAction, undefined);
  return <div className="space-y-1 text-xs"><div className="flex flex-wrap gap-2"><form action={reviewAction}><input type="hidden" name="documentId" value={documentId} /><input type="hidden" name="status" value="APPROVED" /><SubmitButton pendingText="...">Approve</SubmitButton></form><form action={reviewAction}><input type="hidden" name="documentId" value={documentId} /><input type="hidden" name="status" value="REQUESTED_INFO" /><SubmitButton pendingText="...">Request More Info</SubmitButton></form><form action={reviewAction}><input type="hidden" name="documentId" value={documentId} /><input type="hidden" name="status" value="REJECTED" /><SubmitButton pendingText="...">Reject</SubmitButton></form><form action={sendAction}><input type="hidden" name="documentId" value={documentId} /><SubmitButton pendingText="...">Send</SubmitButton></form><form action={deleteAction}><input type="hidden" name="documentId" value={documentId} /><SubmitButton pendingText="...">Delete</SubmitButton></form><a className="rounded border border-gray-300 px-2 py-1 text-brand-dark" href={`mailto:${email}?subject=${encodeURIComponent(`SturdiHome document: ${label}`)}`}>Email</a></div><FormError message={reviewState?.error ?? sendState?.error ?? deleteState?.error} /></div>;
}