import { del, get, put } from "@vercel/blob";
import { scanUpload } from "@/lib/upload-scanning";
import { SEASONAL_EFFECT_MAX_BYTES } from "@/lib/upload-validation";

function blobOptions() {
  const storeId = process.env.BLOB_STORE_ID;
  const oidcToken = process.env.VERCEL_OIDC_TOKEN;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (storeId && oidcToken) return { storeId, oidcToken } as const;
  if (token) return { token } as const;
  throw new Error("Vercel Blob private storage is not configured");
}

export async function putSeasonalBlob(pathname: string, bytes: Uint8Array, contentType: string) {
  await scanUpload(bytes);
  return put(pathname, Buffer.from(bytes), { ...blobOptions(), access: "private", contentType, addRandomSuffix: false, allowOverwrite: false });
}

export async function readSeasonalBlob(pathname: string) {
  const result = await get(pathname, { ...blobOptions(), access: "private", useCache: false });
  if (!result || result.statusCode !== 200 || !result.stream) throw new Error("Seasonal media unavailable");
  if (result.blob.size > SEASONAL_EFFECT_MAX_BYTES) throw new Error("Invalid seasonal media");
  const bytes = await new Response(result.stream).arrayBuffer();
  if (bytes.byteLength > SEASONAL_EFFECT_MAX_BYTES) throw new Error("Invalid seasonal media");
  return { bytes: new Uint8Array(bytes), contentType: result.blob.contentType };
}

export async function deleteSeasonalBlob(pathname: string) {
  await del(pathname, blobOptions());
}
