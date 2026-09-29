"use client";

import { useActionState, useState } from "react";
import { Card, FormError, SubmitButton } from "@/components/ui";
import { activateSeasonalEffectAction, deactivateSeasonalEffectAction, deleteSeasonalEffectAction, uploadSeasonalEffectAction } from "@/lib/actions/experience-actions";

type Effect = { id: string; originalName: string; mimeType: string; byteSize: number; active: boolean };

export default function ExperienceControls({ effects }: { effects: Effect[] }) {
  const [state, uploadAction] = useActionState(uploadSeasonalEffectAction, undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);

  function selectFile(file: File | undefined) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    setPreviewType(file?.type ?? null);
  }

  function clearPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewType(null);
  }

  return <Card>
    <div className="space-y-5">
      <div>
        <h2 className="font-semibold text-brand-navy">Custom Seasonal Experience</h2>
        <p className="mt-1 text-sm text-gray-600">Upload a safe image or muted video. Only an activated effect appears on the public site.</p>
      </div>
      <form action={uploadAction} className="space-y-3">
        <input name="file" type="file" accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm" required onChange={event => selectFile(event.currentTarget.files?.[0])} className="block w-full text-sm" />
        <div className="flex flex-wrap gap-2">
          <SubmitButton pendingText="Uploading...">Upload / Replace</SubmitButton>
          {previewUrl && <button type="button" onClick={clearPreview} className="rounded-md border border-brand-navy/30 px-3 py-2 text-sm font-semibold text-brand-navy">Clear Preview</button>}
        </div>
        <FormError message={state?.error} />
        {state?.success && <p role="status" className="text-sm text-green-700">{state.success}</p>}
        <p className="text-xs text-gray-500">PNG, JPG/JPEG, WebP, GIF, MP4, or WebM; maximum 20 MB. Videos are muted by default.</p>
      </form>
      {previewUrl && <div className="rounded border border-brand-gold/30 bg-gray-50 p-3"><p className="mb-2 text-sm font-semibold text-brand-navy">Preview</p>{previewType?.startsWith("video/") ? <video src={previewUrl} controls muted playsInline className="max-h-64 w-full object-contain" /> : <img src={previewUrl} alt="Seasonal effect preview" className="max-h-64 w-full object-contain" />}</div>}
      <div className="space-y-3">
        {effects.length === 0 ? <p className="text-sm text-gray-500">No custom seasonal media uploaded.</p> : effects.map(effect => <div key={effect.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 p-3"><div><p className="font-medium text-gray-900">{effect.originalName}</p><p className="text-xs text-gray-500">{effect.mimeType} · {Math.ceil(effect.byteSize / 1024)} KB · {effect.active ? "ACTIVE" : "INACTIVE"}</p></div><div className="flex flex-wrap gap-2">{effect.active ? <form action={deactivateSeasonalEffectAction}><input type="hidden" name="effectId" value={effect.id} /><SubmitButton pendingText="...">Deactivate</SubmitButton></form> : <form action={activateSeasonalEffectAction}><input type="hidden" name="effectId" value={effect.id} /><SubmitButton pendingText="...">Activate</SubmitButton></form>}<form action={deleteSeasonalEffectAction} onSubmit={event => { if (!window.confirm(`Delete ${effect.originalName}?`)) event.preventDefault(); }}><input type="hidden" name="effectId" value={effect.id} /><SubmitButton pendingText="...">Delete</SubmitButton></form></div></div>)}
      </div>
    </div>
  </Card>;
}
