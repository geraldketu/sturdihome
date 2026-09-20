import "server-only";

export const syntheticTask4Db = process.env.SYNTHETIC_TEST_DB === "true" || process.env.DATABASE_URL?.includes("127.0.0.1:55439") === true;

export async function syntheticQuery<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  if (!syntheticTask4Db) throw new Error("Synthetic Task 4 database is not enabled");
  const response = await fetch("http://127.0.0.1:55440", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sql, params }), cache: "no-store" });
  if (!response.ok) throw new Error("Synthetic database query failed");
  return await response.json() as T[];
}
