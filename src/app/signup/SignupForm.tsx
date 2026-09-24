"use client";

import { useActionState } from "react";
import { signupAction } from "@/lib/actions/auth-actions";
import { Field, FormError, SubmitButton } from "@/components/ui";

export default function SignupForm({ next, referralCode }: { next?: string; referralCode?: string }) {
  const [state, formAction] = useActionState(signupAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {referralCode && <input type="hidden" name="referralCode" value={referralCode} />}
      <FormError message={state?.error} />
      <div className="grid gap-4 sm:grid-cols-2"><Field label="First Name" name="firstName" required /><Field label="Last Name" name="lastName" required /></div>
      <Field label="Property Address" name="propertyAddress" required />
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]"><Field label="City" name="propertyCity" required /><Field label="State" name="propertyState" required /><Field label="ZIP" name="propertyZip" required /></div>
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone" name="phone" type="tel" />
      <Field label="Date of Birth" name="dateOfBirth" type="date" required />
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">Choose your SturdiHome account</legend>
        <label className="flex gap-3 rounded-md border border-gray-200 p-3 text-sm">
          <input type="radio" name="homeownerAccountType" value="VERIFIED_HOMEOWNER" defaultChecked />
          <span><strong className="block text-gray-900">Verified Homeowner Member</strong><span className="text-gray-600">Access the full member experience, including financing features, after uploading one accepted proof of homeownership.</span></span>
        </label>
        <label className="flex gap-3 rounded-md border border-gray-200 p-3 text-sm">
          <input type="radio" name="homeownerAccountType" value="SERVICE_ONLY" />
          <span><strong className="block text-gray-900">Find a Vendor — No Homeownership Verification Required</strong><span className="text-gray-600">Search and connect with vendors without uploading homeownership documents. Financing features requiring verification are not included.</span></span>
        </label>
      </fieldset>
      <SubmitButton pendingText="Creating account...">Create Account</SubmitButton>
    </form>
  );
}
