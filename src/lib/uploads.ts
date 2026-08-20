import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Vercel's filesystem is read-only outside /tmp, and /tmp doesn't persist across
// invocations, so uploads on that platform only last for the life of a warm instance.
const UPLOAD_ROOT = process.env.VERCEL ? "/tmp/uploads" : path.join(process.cwd(), "uploads");

export async function saveUpload(file: File, userId: string): Promise<string> {
  const userDir = path.join(UPLOAD_ROOT, userId);
  await mkdir(userDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storedName = `${crypto.randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(userDir, storedName), buffer);

  return storedName;
}

export function resolveUploadPath(userId: string, storedName: string): string {
  return path.join(UPLOAD_ROOT, userId, storedName);
}
