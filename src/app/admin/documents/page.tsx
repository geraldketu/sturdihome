import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";

export default async function AdminDocumentsPage() {
  const documents = await prisma.document.findMany({
    include: { user: true },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-dark">Documents</h1>
      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Member</th>
              <th className="px-4 py-2">Label</th>
              <th className="px-4 py-2">Uploaded</th>
              <th className="px-4 py-2">File</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-4 py-2 text-gray-900">{doc.user.name}</td>
                <td className="px-4 py-2 text-gray-600">{doc.label}</td>
                <td className="px-4 py-2 text-gray-500">{doc.uploadedAt.toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <a href={`/api/documents/${doc.id}`} className="font-medium text-brand-dark hover:underline">
                    Download
                  </a>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No documents uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
