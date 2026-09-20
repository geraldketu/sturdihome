export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const UPLOAD_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp";
export class UploadValidationError extends Error {}

export async function validateUpload(file: File): Promise<Uint8Array> {
  if (!file.size || file.size > MAX_UPLOAD_BYTES) throw new UploadValidationError("Choose a file no larger than 4 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = file.name.split(".").pop()?.toLowerCase();
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  const allowed =
    (ext === "pdf" && file.type === "application/pdf" && ascii(0, 5) === "%PDF-") ||
    (ext === "png" && file.type === "image/png" && [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)) ||
    (["jpg", "jpeg"].includes(ext ?? "") && file.type === "image/jpeg" && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) ||
    (ext === "webp" && file.type === "image/webp" && ascii(0,4) === "RIFF" && ascii(8,12) === "WEBP");
  if (!allowed) throw new UploadValidationError("Upload a valid PDF, PNG, JPEG, or WebP file. Other file types are not accepted.");
  return bytes;
}
