"use client";

import { useActionState, useRef } from "react";
import { uploadFlyerAction } from "@/lib/actions/vendor-actions";
import { Field, FormError, SubmitButton } from "@/components/ui";

export default function UploadFlyerForm() {
  const [state, formAction] = useActionState(uploadFlyerAction, undefined);
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
      <Field label="Flyer Label" name="label" required placeholder="e.g. Spring roofing promo" />
      <label className="block text-sm font-medium text-gray-700">
        File
        <input
          type="file"
          name="file"
          required
          accept="image/*,.pdf"
          className="mt-1 block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-dark"
        />
      </label>
      <SubmitButton pendingText="Uploading...">Submit for Approval</SubmitButton>
    </form>
  );
}
