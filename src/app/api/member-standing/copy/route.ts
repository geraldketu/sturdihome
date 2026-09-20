import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getMemberStandingAcceptance } from "@/lib/member-standing";
export async function GET() { const user = await getSessionUser(); if (!user || user.role !== "HOMEOWNER") return new NextResponse("Unauthorized", { status: 401 }); const record = await getMemberStandingAcceptance(user.id); if (!record) return new NextResponse("Not found", { status: 404 }); return new NextResponse(record.signedCopyContent, { headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="${record.documentIdentifier}.txt"`, "Cache-Control": "private, no-store" } }); }
