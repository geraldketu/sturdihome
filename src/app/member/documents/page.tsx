import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import UploadForm from "./UploadForm";

export default async function DocumentsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Required Documents</h1>
        <p className="text-sm text-gray-600">Upload documents required for your homeowner account.</p>
      </div>

      <Card>
        <UploadForm />
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
