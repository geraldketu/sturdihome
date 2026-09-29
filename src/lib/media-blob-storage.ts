import { put } from "@vercel/blob";
import { scanUpload } from "@/lib/upload-scanning";

function blobOptions() {
  const storeId = process.env.BLOB_STORE_ID;
  const oidcToken = process.env.VERCEL_OIDC_TOKEN;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (storeId && oidcToken) return { storeId, oidcToken } as const;
  if (token) return { token } as const;
  throw new Error("Vercel Blob public storage is not configured");
}

export async function putPublicMedia(pathname: string, bytes: Uint8Array, contentType: string) {
  await scanUpload(bytes);
  return put(pathname, Buffer.from(bytes), { ...blobOptions(), access: "public", contentType, addRandomSuffix: false, allowOverwrite: false });
}