import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Badge, Card } from "@/components/ui";

export default async function VendorProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!user.vendorProfile) {
    return (
      <Card>
        <p className="text-sm text-gray-600">No vendor profile attached to this account.</p>
      </Card>
    );
  }

  const p = user.vendorProfile;

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
            <dt className="text-gray-500">Service Area</dt>
            <dd className="text-gray-900">{p.serviceArea}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Services Offered</dt>
            <dd className="text-right text-gray-900">{p.servicesOffered}</dd>
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
