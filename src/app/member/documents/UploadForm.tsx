"use client";

import { UPLOAD_ACCEPT } from "@/lib/upload-validation";
import { useActionState, useRef } from "react";
import { uploadDocumentAction } from "@/lib/actions/member-actions";
import { FormError, SubmitButton } from "@/components/ui";

export default function UploadForm() {
  const [state, formAction] = useActionState(uploadDocumentAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="space-y-4"
    >
      <FormError message={state?.error} />
      <label className="block text-sm font-medium text-gray-700">
        Proof of homeownership
        <select name="documentType" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700">
          <option value="">Choose one document</option>
          <option value="PROPERTY_TAX_BILL">Property tax bill</option>
          <option value="MORTGAGE_STATEMENT">Mortgage statement</option>
          <option value="HOMEOWNERS_INSURANCE_DECLARATION_PAGE">Homeowners insurance declaration page</option>
          <option value="DEED">Deed</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-gray-700">
        File
        <input
          type="file"
          accept={UPLOAD_ACCEPT}
          name="file"
          required
          className="mt-1 block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-dark"
        />
      </label>
      <SubmitButton pendingText="Uploading...">Upload Document</SubmitButton>
    </form>
  );
}
