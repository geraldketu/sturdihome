import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card } from "@/components/ui";
import UploadFlyerForm from "./UploadFlyerForm";

export default async function VendorFlyersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!user.vendorProfile) {
    return (
      <Card>
        <p className="text-sm text-gray-600">No vendor profile attached to this account.</p>
      </Card>
    );
  }

  const flyers = await prisma.vendorFlyer.findMany({
    where: { vendorProfileId: user.vendorProfile.id },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Promotional Flyers</h1>
        <p className="text-sm text-gray-600">
          Submit promotional flyers for SturdiHome admin review. Approved flyers may be
          used to promote your company.
        </p>
      </div>

      <Card>
        <UploadFlyerForm />
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold text-gray-900">Your Flyers</h2>
        {flyers.length === 0 ? (
          <p className="text-sm text-gray-500">No flyers submitted yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {flyers.map((flyer) => (
              <li key={flyer.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="text-gray-800">{flyer.label}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {flyer.uploadedAt.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={flyer.status === "APPROVED" ? "green" : flyer.status === "REJECTED" ? "red" : "yellow"}>
                    {flyer.status}
                  </Badge>
                  <a
                    href={`/api/vendor-flyers/${flyer.id}`}
                    className="font-medium text-brand-dark hover:underline"
                  >
                    View
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
