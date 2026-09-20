import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCharacterStatus } from "@/lib/character-entitlements";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getCharacterStatus(user.id), { headers: { "Cache-Control": "private, no-store" } });
}