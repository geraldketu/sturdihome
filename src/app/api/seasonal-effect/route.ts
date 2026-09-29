import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSeasonalBlob } from "@/lib/seasonal-blob-storage";

export async function GET() {
  const effect = await prisma.seasonalEffect.findFirst({ where: { active: true, deletedAt: null }, orderBy: { createdAt: "desc" } });
  if (!effect) return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  try {
    const media = await readSeasonalBlob(effect.fileName);
    return new NextResponse(Buffer.from(media.bytes), { headers: { "Content-Type": media.contentType || effect.mimeType, "Cache-Control": "private, no-cache, max-age=0", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; media-src 'self'; img-src 'self' data:" } });
  } catch {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
}