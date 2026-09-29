export async function scanUpload(bytes: Uint8Array) {
  const endpoint = process.env.UPLOAD_SCAN_URL;
  const token = process.env.UPLOAD_SCAN_TOKEN;
  if (!endpoint || !token) throw new Error("Upload scanning is not configured");
  const url = new URL(endpoint);
  if (url.username || url.password || (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname)))) throw new Error("Invalid scanner endpoint");
  const response = await fetch(url, { method: "POST", redirect: "error", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/octet-stream" }, body: Buffer.from(bytes), signal: AbortSignal.timeout(20000) });
  if (!response.ok || (await response.json()).clean !== true) throw new Error("File did not pass security scanning");
}
