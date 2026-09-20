"use client";
import { useActionState, useState } from "react";
import { acceptNetworkAgreement } from "@/lib/actions/agreement-actions";
import { FormError, SubmitButton } from "@/components/ui";
export default function AgreementForm({ agreementId, companyName }: { agreementId: string; companyName?: string }) {
  const [state, action] = useActionState(acceptNetworkAgreement, undefined);
  const [accepted, setAccepted] = useState(false);
  const [electronicConsent, setElectronicConsent] = useState(false);
  const [fullLegalName, setFullLegalName] = useState("");
  const [signature, setSignature] = useState("");
  const [company, setCompany] = useState(companyName ?? "");
  const ready = accepted && electronicConsent && fullLegalName.trim() !== "" && signature.trim() === fullLegalName.trim() && (companyName === undefined || company.trim() !== "");
  return <form action={action} className="mt-5 space-y-4">
    <input type="hidden" name="agreementId" value={agreementId} />
    <FormError message={state?.error} />
    <label className="flex items-start gap-3 text-sm"><input className="mt-1" type="checkbox" name="accepted" value="yes" required checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />I have read and agree to the SturdiHome Network LLC Terms &amp; Conditions.</label>
    <label className="flex items-start gap-3 text-sm"><input className="mt-1" type="checkbox" name="electronicConsent" value="yes" required checked={electronicConsent} onChange={(event) => setElectronicConsent(event.target.checked)} />I consent to electronic records and electronic signatures.</label>
    <label className="block text-sm font-medium text-gray-700">Full Legal Name<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" name="fullLegalName" value={fullLegalName} onChange={(event) => setFullLegalName(event.target.value)} required maxLength={200} /></label>
    {companyName !== undefined && <label className="block text-sm font-medium text-gray-700">Company Name<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" name="companyName" value={company} onChange={(event) => setCompany(event.target.value)} required maxLength={200} /></label>}
    <label className="block text-sm font-medium text-gray-700">Electronic Signature<input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2" name="electronicSignature" value={signature} onChange={(event) => setSignature(event.target.value)} placeholder="Type your full legal name" required maxLength={200} /></label>
    <SubmitButton pendingText="Signing..." disabled={!ready}>AGREE &amp; SIGN</SubmitButton>
  </form>;
}
