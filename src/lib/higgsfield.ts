import "server-only";
import { createHiggsfieldClient } from "@higgsfield/client/v2";

export function getHiggsfieldCredentials(): string {
  const credentials = process.env.HF_CREDENTIALS?.trim();
  if (!credentials || !/^[^\s:]+:[^\s:]+$/.test(credentials)) {
    throw new Error("Set HF_CREDENTIALS to your Higgsfield key ID and secret, separated by a colon.");
  }
  return credentials;
}

/** Only call from authenticated, authorized server code. Generation uses credits. */
export function getHiggsfield() {
  return createHiggsfieldClient({
    credentials: getHiggsfieldCredentials(),
    baseURL: "https://api.higgsfield.ai",
    timeout: 30_000,
    // Avoid resubmitting billable requests after ambiguous network failures.
    maxRetries: 0,
  });
}
