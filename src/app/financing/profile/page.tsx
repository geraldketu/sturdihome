import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Badge, Card } from "@/components/ui";

export default async function FinancingProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!user.financingProfile) {
    return (
      <Card>
        <p className="text-sm text-gray-600">No financing profile attached to this account.</p>
      </Card>
    );
  }

  const p = user.financingProfile;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-brand-dark">Company Profile</h1>
      <Card>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Company Name</dt>
            <dd className="text-gray-900">{p.companyName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">License / Accreditation</dt>
            <dd className="text-right text-gray-900">{p.licenseInfo}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Application Status</dt>
            <dd>
              <Badge tone={p.status === "APPROVED" ? "green" : "yellow"}>{p.status}</Badge>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Contact Email</dt>
            <dd className="text-gray-900">{user.email}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
