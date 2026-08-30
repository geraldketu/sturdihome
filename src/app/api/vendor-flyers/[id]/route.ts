import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/uploads";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

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
    const filePath = resolveUploadPath(flyer.vendorProfile.userId, flyer.fileName);
    const buffer = await readFile(filePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `inline; filename="${flyer.label.replace(/[^a-zA-Z0-9._ -]/g, "_")}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }
}
