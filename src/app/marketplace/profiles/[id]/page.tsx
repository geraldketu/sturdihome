import Link from "next/link";
import { notFound } from "next/navigation";
import { getListing } from "@/lib/marketplace";
import { BusinessImage } from "@/components/Marketplace";

export const dynamic = "force-dynamic";
export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getListing(id);
  if (!p) notFound();
  return <main className="mx-auto max-w-5xl px-4 py-12">
    <Link className="text-sm text-brand underline" href={p.kind === "vendor" ? "/marketplace/vendors" : "/marketplace/financing"}>← Back to directory</Link>
    <section className="mt-6 rounded-2xl border border-brand-gold/30 bg-white p-6 sm:p-10">
      <BusinessImage src={p.logo} name={p.companyName} />
      <p className="mt-6 text-sm font-semibold text-brand">{p.categories.join(" · ") || "Financing partner"}</p>
      <h1 className="mt-2 break-words font-display text-4xl text-brand-navy">{p.companyName}</h1>
      <p className="mt-5 whitespace-pre-wrap leading-7 text-gray-600">{p.description}</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2"><div><h2 className="text-lg font-semibold text-brand-navy">{p.kind === "vendor" ? "Services offered" : "Financing options"}</h2><p className="mt-2 whitespace-pre-wrap text-gray-600">{p.services}</p></div><div><h2 className="text-lg font-semibold text-brand-navy">Service area</h2><p className="mt-2 text-gray-600">{p.areas.join(", ")}</p></div></div>
      <h2 className="mt-8 text-lg font-semibold text-brand-navy">Contact this {p.kind === "vendor" ? "vendor" : "partner"} directly</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-brand px-5 py-3 font-semibold text-white">Visit {p.kind === "vendor" ? "Vendor" : "Partner"} Website ↗</a>}
        {p.phone && <a href={`tel:${p.phone.replace(/[^+\d]/g, "")}`} className="rounded-lg border border-brand-navy/20 px-5 py-3 text-brand-navy">Call {p.phone}</a>}
        {p.email && <a href={`mailto:${p.email}`} className="break-all rounded-lg border border-brand-navy/20 px-5 py-3 text-brand-navy">Email {p.email}</a>}
        {p.kind === "vendor" && <Link href={`/member/service-request?vendor=${encodeURIComponent(p.id)}`} className="rounded-lg bg-brand-navy px-5 py-3 font-semibold text-white">Request Estimate</Link>}
      </div>
      <p className="mt-4 text-sm leading-6 text-gray-600">You decide whether to make contact. SturdiHome does not send your details to this business when you view this page. Business information is supplied by the partner; confirm availability and details directly.</p>
      {p.kind === "financing" && <p className="mt-5 rounded-xl bg-brand-gold-pale/30 p-4 text-sm leading-6 text-brand-navy">SturdiHome is not a lender and does not make financing approval decisions. Financing providers determine eligibility, approval, rates, and terms.</p>}
    </section>
    <section className="mt-10"><h2 className="mb-5 text-2xl font-semibold text-brand-navy">{p.kind === "vendor" ? "Project photos" : "Partner photos"}</h2>{p.photos.length ? <div className="grid gap-4 sm:grid-cols-2">{p.photos.map((src, i) => <BusinessImage key={`${src}-${i}`} src={src} name={p.companyName} photo />)}</div> : <p className="text-gray-600">This business has not added photos yet.</p>}</section>
  </main>;
}
