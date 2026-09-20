import { loadEnvConfig } from "@next/env";
import { randomUUID } from "node:crypto";
import { getHiggsfield, getHiggsfieldCredentials } from "../src/lib/higgsfield";

async function main() {
  loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", {
    info() {},
    error() {},
  });
  getHiggsfield();
  const credentials = getHiggsfieldCredentials();
  // Read a nonexistent request: no generation or charges. Compare with a bad
  // credential so a generic 404 cannot be mistaken for successful authentication.
  const url = `https://api.higgsfield.ai/requests/${randomUUID()}/status`;
  const probe = async (key: string) => {
    const response = await fetch(url, {
      headers: { Authorization: `Key ${key}` },
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    await response.body?.cancel();
    return response.status;
  };
  const invalidStatus = await probe(`${randomUUID()}:${"0".repeat(64)}`);
  const configuredStatus = await probe(credentials);
  console.log(`Read-only probe: configured key HTTP ${configuredStatus}; invalid key HTTP ${invalidStatus}.`);
  if (configuredStatus === 404 && invalidStatus === 401) {
    console.log("Authentication check passed: the configured key reached request lookup, while an invalid key was rejected. No credits spent. Account email and generation access were not verified.");
    return;
  }
  if (configuredStatus === 401) {
    throw new Error("Higgsfield rejected the configured API credentials. Replace HF_CREDENTIALS in your environment files.");
  }
  throw new Error("Authentication could not be confirmed by the read-only probe. Check account API access; generation has not been tested.");
}

main().catch((error: unknown) => {
  // Never print SDK request objects, headers, credentials, or response bodies.
  console.error(error instanceof Error ? error.message : "Higgsfield connection check failed.");
  process.exitCode = 1;
});
