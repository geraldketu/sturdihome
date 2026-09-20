import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { validateUpload } from "@/lib/upload-validation";
import { putPrivateUpload, readPrivateUpload, scanUpload } from "@/lib/private-storage";

// Vercel's filesystem is read-only outside /tmp, and /tmp doesn't persist across
// invocations, so uploads on that platform only last for the life of a warm instance.
const UPLOAD_ROOT = process.env.VERCEL ? "/tmp/uploads" : path.join(process.cwd(), "uploads");

export async function saveUpload(file: File, userId: string): Promise<string> {
  const buffer = await validateUpload(file);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  const storedName = `${crypto.randomUUID()}-${safeName}`;
  await putPrivateUpload(userId, storedName, buffer);
  return `s3:${storedName}`;
}

export async function readUpload(userId: string, storedName: string) {
  if (storedName.startsWith("s3:")) return readPrivateUpload(userId, storedName.slice(3));
  // Preserve legacy records; scan old files before serving. Never create new
  // ephemeral files. Existing files must be migrated before a serverless rollout.
  const buffer = await readFile(resolveUploadPath(userId, storedName));
  if (buffer.length > 4 * 1024 * 1024) throw new Error("Invalid stored file");
  await scanUpload(buffer);
  return buffer;
}

export function resolveUploadPath(userId: string, storedName: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(userId) || !/^[a-zA-Z0-9._-]+$/.test(storedName) || storedName === "." || storedName === "..") throw new Error("Invalid file path");
  const directory = path.resolve(UPLOAD_ROOT, userId);
  const resolved = path.resolve(directory, storedName);
  if (!resolved.startsWith(directory + path.sep)) throw new Error("Invalid file path");
  return resolved;
}
