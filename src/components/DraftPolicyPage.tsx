import { Card } from "@/components/ui";

export default function DraftPolicyPage({ title, topic }: { title: string; topic: string }) {
  return <main className="mx-auto max-w-3xl px-4 py-16"><Card><p className="text-xs font-semibold uppercase tracking-widest text-brand">DRAFT FOR OWNER/LEGAL REVIEW</p><h1 className="mt-3 text-3xl font-bold text-brand-navy">{title}</h1><p className="mt-5 leading-7 text-gray-700">SturdiHome is preparing its {topic}. This page is a clearly labeled draft placeholder and is not final legal advice or a completed policy. The owner and qualified legal adviser must review and approve the final text before publication.</p><p className="mt-4 leading-7 text-gray-700">For immediate help, contact SturdiHome through the existing support contact shown in the site header.</p></Card></main>;
}
