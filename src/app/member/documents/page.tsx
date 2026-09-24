import { redirect } from "next/navigation";
import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import UploadForm from "./UploadForm";
import { getMemberStandingAcceptance } from "@/lib/member-standing";
import { isHomeownerVerified } from "@/lib/homeowner-access";

export default async function DocumentsPage() {
  const user = await requirePageAccess("/member/documents");
  if (!user) redirect("/login");

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { uploadedAt: "desc" },
  });
  const agreements = await prisma.agreementAcceptance.findMany({ where: { userId: user.id, role: "HOMEOWNER" }, orderBy: { acceptedAt: "desc" } });
  const standing = await getMemberStandingAcceptance(user.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Required Documents</h1>
        <p className="text-sm text-gray-600">Only one document is required: a property tax bill, mortgage statement, homeowners insurance declaration page, or deed.</p>
        <p className="mt-2 text-sm text-gray-600">Verification documents are private and are accessible only to you and authorized SturdiHome administrators.</p>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold text-gray-900">My Documents</h2>
        {standing && <div className="flex items-center justify-between border-b border-gray-100 py-2 text-sm"><span>{standing.documentIdentifier} · Version {standing.version}</span><a className="font-medium text-brand-dark hover:underline" href="/api/member-standing/copy">Download signed copy</a></div>}
        {agreements.map((agreement) => <div key={agreement.id} className="flex items-center justify-between border-b border-gray-100 py-2 text-sm"><span>{agreement.agreementTitle} · Version {agreement.version}</span><a className="font-medium text-brand-dark hover:underline" href={`/api/agreements/${agreement.id}/copy`}>Download signed copy</a></div>)}
        {!agreements.length && <p className="text-sm text-gray-500">No signed agreements yet.</p>}
      </Card>

      <Card>
        {user.homeownerAccountType === "SERVICE_ONLY" ? <p className="text-sm text-gray-600">Service-only accounts do not require proof of homeownership or document uploads.</p> : isHomeownerVerified(user) ? <p className="text-sm text-green-700">Homeownership verified. Your proof document is saved privately in My Documents.</p> : user.homeownerVerificationStatus === "PENDING_MANUAL_VERIFICATION" ? <p className="text-sm text-yellow-700">Pending Manual Verification. SturdiHome will notify you when Admin review is complete.</p> : user.homeownerVerificationStatus === "ADDITIONAL_VERIFICATION_NEEDED" ? <UploadForm /> : <UploadForm />}
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-gray-900">Uploaded Documents</h2>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500">No documents uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-800">{doc.label}</span>
                <a
                  href={`/api/documents/${doc.id}`}
                  className="font-medium text-brand-dark hover:underline"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
