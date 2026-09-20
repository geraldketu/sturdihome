import { accountGate } from "@/lib/approval";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readUpload } from "@/lib/uploads";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (user.role !== "ADMIN" && (user.role !== "VENDOR" || user.vendorProfile?.status !== "APPROVED")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (await accountGate(user)) return NextResponse.json({ error: "Agreement and admin approval required" }, { status: 403 });
  const { id } = await params;
  const flyer = await prisma.vendorFlyer.findUnique({
    where: { id },
    include: { vendorProfile: true },
  });
  if (!flyer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = flyer.vendorProfile.userId === user.id;
  if (!isOwner && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const buffer = await readUpload(flyer.vendorProfile.userId, flyer.fileName);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Security-Policy": "sandbox",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${flyer.label.replace(/[^a-zA-Z0-9._ -]/g, "_")}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 });
  }
}
