import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getMemberStandingAcceptance } from "@/lib/member-standing";
import { renderBrandedDocument } from "@/lib/branded-document";
export async function GET() { const user = await getSessionUser(); if (!user || user.role !== "HOMEOWNER") return new NextResponse("Unauthorized", { status: 401 }); const record = await getMemberStandingAcceptance(user.id); if (!record) return new NextResponse("Not found", { status: 404 }); const document = await renderBrandedDocument("SturdiHome Network Member Agreement", record.signedCopyContent); return new NextResponse(document, { headers: { "Content-Type": "text/html; charset=utf-8", "Content-Disposition": `attachment; filename="${record.documentIdentifier}.html"`, "Cache-Control": "private, no-store" } }); }
