"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { saveMediaAction, uploadMediaAction } from "@/lib/actions/content-actions";
import { PUBLIC_MEDIA_MAX_BYTES, validatePublicMedia } from "@/lib/upload-validation";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm";

export default function MediaUploadForm() {
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadForm = useRef<HTMLFormElement>(null);
  const sourceUrlInput = useRef<HTMLInputElement>(null);
  const [uploadState, uploadAction, uploading] = useActionState(uploadMediaAction, undefined);
  const [selectedName, setSelectedName] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "logo">("image");

  useEffect(() => {
    if (uploadState?.url && sourceUrlInput.current) sourceUrlInput.current.value = uploadState.url;
  }, [uploadState]);

  async function selectFile(file: File | undefined) {
    setClientError(null);
    setSelectedName(file?.name ?? "");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (!file) return;
    try {
      await validatePublicMedia(file);
      setMediaType(file.type.startsWith("video/") ? "video" : "image");
      if (file.type.startsWith("image/")) setPreviewUrl(URL.createObjectURL(file));
      uploadForm.current?.requestSubmit();
    } catch (error) {
      setClientError(error instanceof Error ? error.message : "This file cannot be uploaded.");
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return <div className="space-y-3">
    <form ref={uploadForm} action={uploadAction}>
      <input ref={fileInput} name="file" type="file" accept={ACCEPT} className="sr-only" onChange={event => void selectFile(event.currentTarget.files?.[0])} />
      <button type="button" onClick={() => fileInput.current?.click()} className="rounded border border-brand px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand/10">Upload From Computer</button>
    </form>
    {selectedName && <p className="text-sm text-gray-600">Selected: {selectedName}</p>}
    {(uploading || uploadState?.url) && <p role="status" className="text-sm text-gray-600">{uploading ? "Uploading media..." : "Media uploaded. The public URL has been inserted."}</p>}
    {(clientError || uploadState?.error) && <p role="alert" className="text-sm text-red-700">{clientError ?? uploadState?.error}</p>}
    {previewUrl && <img src={previewUrl} alt="Selected media preview" className="max-h-48 rounded border object-contain" />}
    <form action={saveMediaAction} className="grid gap-3 sm:grid-cols-2">
      <input name="label" required placeholder="Asset name" className="rounded border p-2" />
      <input ref={sourceUrlInput} name="sourceUrl" defaultValue="" type="url" required placeholder="Public HTTPS media URL" className="rounded border p-2" />
      <select name="mediaType" value={mediaType} onChange={event => setMediaType(event.target.value as "image" | "video" | "logo")} className="rounded border p-2"><option value="image">Image</option><option value="video">Video</option><option value="logo">Logo</option></select>
      <input name="altText" placeholder="Alt text" className="rounded border p-2" />
      <textarea name="description" placeholder="Description" className="rounded border p-2 sm:col-span-2" />
      <label className="flex gap-2"><input name="published" type="checkbox" /> Published</label>
      <p className="text-xs text-gray-500 sm:col-span-2">JPG/JPEG, PNG, WEBP, GIF, MP4, or WEBM. Maximum {PUBLIC_MEDIA_MAX_BYTES / 1024 / 1024} MB.</p>
      <button className="rounded bg-brand px-4 py-2 font-semibold text-white sm:col-span-2">Add Media</button>
    </form>
  </div>;
}