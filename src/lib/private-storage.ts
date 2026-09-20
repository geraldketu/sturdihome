import "server-only";
import { S3Client, GetPublicAccessBlockCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { MAX_UPLOAD_BYTES } from "./upload-validation";

function storage() {
  const { PRIVATE_S3_BUCKET: bucket, PRIVATE_S3_REGION: region, PRIVATE_S3_ACCESS_KEY_ID: accessKeyId, PRIVATE_S3_SECRET_ACCESS_KEY: secretAccessKey } = process.env;
  if (!bucket || !region || !accessKeyId || !secretAccessKey) throw new Error("Private storage is not configured");
  const endpoint = process.env.PRIVATE_S3_ENDPOINT;
  if (endpoint) {
    const url = new URL(endpoint);
    if (url.username || url.password || (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname)))) throw new Error("Invalid storage endpoint");
  }
  return { bucket, client: new S3Client({ region, endpoint, forcePathStyle: !!endpoint, credentials: { accessKeyId, secretAccessKey }, maxAttempts: 2 }) };
}

async function privateBucket() {
  const { client, bucket } = storage();
  const result = await client.send(new GetPublicAccessBlockCommand({ Bucket: bucket }), { abortSignal: AbortSignal.timeout(10000) });
  const b = result.PublicAccessBlockConfiguration;
  if (!b?.BlockPublicAcls || !b.IgnorePublicAcls || !b.BlockPublicPolicy || !b.RestrictPublicBuckets) throw new Error("Bucket must block all public access");
  return { client, bucket };
}

export function objectKey(userId: string, name: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(userId) || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,180}$/.test(name)) throw new Error("Invalid storage key");
  return `private/${userId}/${name}`;
}

// Scanner contract: authenticated HTTPS POST of bytes; JSON { clean: true } only
// after a full scan. Missing service, timeouts or any other response fail closed.
export async function scanUpload(bytes: Uint8Array) {
  const endpoint = process.env.UPLOAD_SCAN_URL;
  const token = process.env.UPLOAD_SCAN_TOKEN;
  if (!endpoint || !token) throw new Error("Upload scanning is not configured");
  const url = new URL(endpoint);
  if (url.username || url.password || (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname)))) throw new Error("Invalid scanner endpoint");
  const response = await fetch(url, { method: "POST", redirect: "error", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/octet-stream" }, body: Buffer.from(bytes), signal: AbortSignal.timeout(20000) });
  if (!response.ok || (await response.json()).clean !== true) throw new Error("File did not pass security scanning");
}

export async function putPrivateUpload(userId: string, name: string, bytes: Uint8Array) {
  const Key = objectKey(userId, name);
  await scanUpload(bytes);
  const { client, bucket } = await privateBucket();
  await client.send(new PutObjectCommand({ Bucket: bucket, Key, Body: bytes, ContentLength: bytes.length, ContentType: "application/octet-stream", ServerSideEncryption: "AES256" }), { abortSignal: AbortSignal.timeout(20000) });
}

export async function readPrivateUpload(userId: string, name: string) {
  const Key = objectKey(userId, name);
  const { client, bucket } = await privateBucket();
  const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key }), { abortSignal: AbortSignal.timeout(20000) });
  if (!result.Body || !result.ContentLength || result.ContentLength > MAX_UPLOAD_BYTES) throw new Error("Invalid stored file");
  const bytes = await result.Body.transformToByteArray();
  if (bytes.length > MAX_UPLOAD_BYTES) throw new Error("Invalid stored file");
  return bytes;
}
