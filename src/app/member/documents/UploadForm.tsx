"use client";

import { useActionState, useRef } from "react";
import { uploadDocumentAction } from "@/lib/actions/member-actions";
import { Field, FormError, SubmitButton } from "@/components/ui";

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
      <Field label="Document Label" name="label" required placeholder="e.g. Proof of homeownership" />
      <label className="block text-sm font-medium text-gray-700">
        File
        <input
          type="file"
          name="file"
          required
          className="mt-1 block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-dark"
        />
      </label>
      <SubmitButton pendingText="Uploading...">Upload Document</SubmitButton>
    </form>
  );
}
