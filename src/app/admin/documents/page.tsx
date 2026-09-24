import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import { removeFromPageAction, updateApplicationAction, uploadAdminDocument } from "@/lib/actions/admin-document-actions";
import DocumentAdminActions from "./DocumentAdminActions";

export default async function AdminDocumentsPage({ searchParams }: { searchParams: Promise<{ category?: string; userId?: string }> }) {
  await requirePageAccess("/admin/documents");
  const params = await searchParams;
  const role = params.category === "vendors" ? "VENDOR" : params.category === "finance-partners" ? "FINANCING_PARTNER" : "HOMEOWNER";
  const accounts = await prisma.user.findMany({ where: { role }, orderBy: { name: "asc" }, include: { vendorProfile: true, financingProfile: true } });
  const selected = accounts.find(account => account.id === params.userId) ?? accounts[0];
  const documents = await prisma.document.findMany({
    where: { userId: selected?.id, deletedAt: null },
    include: { user: true },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-dark">Applications and Documents</h1>
      <form className="grid gap-3 sm:grid-cols-2" method="get"><label className="text-sm font-medium text-gray-700">Account category<select name="category" defaultValue={params.category ?? "members"} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"><option value="members">Members</option><option value="vendors">Vendors</option><option value="finance-partners">Finance Partners</option></select></label><label className="text-sm font-medium text-gray-700">Individual account<select name="userId" defaultValue={selected?.id} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">{accounts.map(account => <option key={account.id} value={account.id}>{account.name} · {account.email}</option>)}</select></label><button className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark sm:w-fit">View Account</button></form>
      {selected && <Card className="space-y-3"><h2 className="font-semibold text-brand-navy">Application: {selected.name}</h2><p className="text-sm text-gray-600">{selected.email} · {selected.phone ?? "No phone"}</p><p className="text-sm text-gray-600">Approval: {selected.approvalStatus} · Account: {selected.accountStatus}</p>{selected.vendorProfile && <p className="text-sm text-gray-600">Vendor application: {selected.vendorProfile.companyName} · {selected.vendorProfile.serviceArea}</p>}{selected.financingProfile && <p className="text-sm text-gray-600">Finance partner application: {selected.financingProfile.companyName} · {selected.financingProfile.licenseInfo}</p>}<form action={updateApplicationAction} className="grid gap-2 sm:grid-cols-3"><input type="hidden" name="userId" value={selected.id} /><input name="name" defaultValue={selected.name} className="rounded border border-gray-300 px-2 py-1.5 text-sm" /><input name="phone" defaultValue={selected.phone ?? ""} placeholder="Phone" className="rounded border border-gray-300 px-2 py-1.5 text-sm" /><select name="approvalStatus" defaultValue={selected.approvalStatus} className="rounded border border-gray-300 px-2 py-1.5 text-sm"><option>PENDING</option><option>APPROVED</option><option>REJECTED</option></select><button className="rounded-md border border-brand-navy/30 px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-gray-50 sm:w-fit">Edit Application</button></form><form action={removeFromPageAction} className="flex flex-wrap items-end gap-2"><input type="hidden" name="userId" value={selected.id} /><label className="text-sm font-medium text-gray-700">Remove From Page<select name="pageKey" className="mt-1 block rounded border border-gray-300 px-2 py-1.5 text-sm"><option value="finance">Finance Page</option><option value="service">Service Page</option><option value="vendor">Vendor Page</option><option value="homeowner">Homeowner Page</option></select></label><button className="rounded-md border border-brand-navy/30 px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-gray-50">Remove From Page</button></form></Card>}
      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Account</th>
              <th className="px-4 py-2">Label</th>
              <th className="px-4 py-2">Uploaded</th>
              <th className="px-4 py-2">File</th>
              <th className="px-4 py-2">Actions</th>
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
                <td className="px-4 py-2"><DocumentAdminActions documentId={doc.id} email={doc.user.email} label={doc.label} /></td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No documents uploaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      {selected && <Card><h2 className="font-semibold text-brand-navy">Upload for this account</h2><form action={uploadAdminDocument} className="mt-3 grid gap-2 sm:grid-cols-3"><input type="hidden" name="userId" value={selected.id} /><input name="label" required placeholder="Document label" className="rounded border border-gray-300 px-2 py-1.5 text-sm" /><input name="file" type="file" required className="text-sm" /><button className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white">Upload</button></form></Card>}
    </div>
  );
}
