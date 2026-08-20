import { Card } from "@/components/ui";
import VendorApplicationForm from "./VendorApplicationForm";

export default function VendorApplyPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-bold text-brand-dark">
        Vendor Application
      </h1>
      <p className="mb-6 text-center text-sm text-gray-600">
        Apply to join the SturdiHome vendor network. Once approved, you&apos;ll be able
        to log in and receive qualified homeowner leads in your service area.
      </p>
      <Card>
        <VendorApplicationForm />
      </Card>
    </main>
  );
}
