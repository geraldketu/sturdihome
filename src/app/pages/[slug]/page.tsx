import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const page = await prisma.siteContentPage.findFirst({ where: { slug, published: true, protected: false } }); if (!page) notFound(); return <main className="mx-auto max-w-4xl px-4 py-16"><p className="text-xs font-semibold uppercase tracking-widest text-brand">SturdiHome Network</p><h1 className="mt-3 font-display text-4xl text-brand-navy">{page.title}</h1><div className="mt-8 whitespace-pre-wrap leading-7 text-gray-700">{page.body}</div></main>; }
