import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import AgreementForm from "@/components/AgreementForm";
import Image from "next/image";
export default async function AgreementPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");
  const agreement = await prisma.networkAgreement.findFirst({ where: { role: user.role, active: true } });
  const acceptance = agreement && await prisma.agreementAcceptance.findUnique({ where: { userId_role_version: { userId: user.id, role: user.role, version: agreement.version } } });
  return <main className="mx-auto w-full max-w-3xl px-4 py-12"><Card>
    <Image src="/images/portal-logo.png" alt="SturdiHome Network" width={180} height={48} className="mb-6 h-12 w-auto" />
    <h1 className="text-2xl font-bold text-brand-navy">{agreement?.title ?? "Your Network Agreement"}</h1>
    {agreement ? <>
      <p className="mt-2 text-sm text-gray-500">Effective date {agreement.effectiveDate.toLocaleDateString()} · Version {agreement.version}</p>
      <div className="mt-5 max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-md border border-brand-navy/10 bg-white p-5 text-sm leading-7 text-gray-700">{agreement.content}</div>
      <p className="mt-3 text-right text-xs text-gray-500"><a href={`/api/agreements/${agreement.id}/copy`} target="_blank" rel="noreferrer" className="font-medium text-brand-dark underline">Download/Print Copy</a></p>
      {acceptance && user.agreementVersion === agreement.version && user.agreementAcceptedAt ? <p className="mt-5 text-brand">Agreement accepted. <a className="underline" href="/pending-approval">Check your approval status</a>.</p> : <AgreementForm agreementId={agreement.id} companyName={user.vendorProfile?.companyName ?? user.financingProfile?.companyName} />}
    </> : <p className="mt-5 text-gray-600">Your agreement is being prepared. Please contact SturdiHome. Services remain unavailable until you accept the agreement and an administrator approves your account.</p>}
  </Card></main>;
}
