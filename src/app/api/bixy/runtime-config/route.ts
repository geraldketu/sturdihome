import { NextResponse } from "next/server";
import { getBixySettings, getPublicBixySettings } from "@/lib/bixy-settings";

export async function GET() { const settings = await getBixySettings(); return NextResponse.json(getPublicBixySettings(settings), { headers: { "Cache-Control": "private, no-store" } }); }
