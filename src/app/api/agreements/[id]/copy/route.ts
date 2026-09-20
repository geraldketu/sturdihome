import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await params;
  const agreement = await prisma.networkAgreement.findUnique({ where: { id } });
  const acceptanceRecord = agreement ? null : await prisma.agreementAcceptance.findUnique({ where: { id } });
  const role = agreement?.role ?? acceptanceRecord?.role;
  const version = agreement?.version ?? acceptanceRecord?.version;
  if ((!agreement && !acceptanceRecord) || (user.role !== "ADMIN" && role !== user.role)) return new NextResponse("Not found", { status: 404 });
  if (acceptanceRecord && user.role !== "ADMIN" && acceptanceRecord.userId !== user.id) return new NextResponse("Not found", { status: 404 });
  const acceptance = acceptanceRecord ?? (role && version ? await prisma.agreementAcceptance.findUnique({ where: { userId_role_version: { userId: user.id, role, version } } }) : null);
  if (user.role !== "ADMIN" && !acceptance) return new NextResponse("Not found", { status: 404 });
  const body = acceptance?.signedCopyContent ?? agreement?.content ?? "";
  const fileName = agreement?.documentIdentifier ?? acceptance?.documentIdentifier ?? "sturdihome-agreement";
  return new NextResponse(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="${fileName}.txt"`, "Cache-Control": "private, no-store" } });
}