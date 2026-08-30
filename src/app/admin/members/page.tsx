import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";

export default async function AdminMembersPage() {
  const members = await prisma.user.findMany({
    where: { role: "HOMEOWNER" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-dark">Members</h1>
      <Card className="overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Agreement</th>
              <th className="px-4 py-2">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-2 text-gray-900">
                  <Link href={`/admin/members/${m.id}`} className="font-medium hover:text-brand-dark hover:underline">
                    {m.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-gray-600">{m.email}</td>
                <td className="px-4 py-2">
                  <Badge tone={m.agreementAcceptedAt ? "green" : "gray"}>
                    {m.agreementAcceptedAt ? "Signed" : "Pending"}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-gray-500">{m.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
