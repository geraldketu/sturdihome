import "server-only";

// In-memory, per-warm-instance rate limit. Vercel serverless functions can scale to
// multiple instances, so this is a best-effort abuse guard, not a hard global limit --
// good enough for a chat widget's blast radius, not a substitute for a shared store
// (e.g. Upstash Redis) if this ever needs a real global cap.
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

const hits = new Map<string, number[]>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  hits.set(key, timestamps);

  // Prevent unbounded growth across many distinct IPs on a long-lived warm instance.
  if (hits.size > 5000) {
    hits.clear();
  }

  return false;
}
