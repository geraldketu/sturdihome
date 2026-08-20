import { Card } from "@/components/ui";
import FinancingApplicationForm from "./FinancingApplicationForm";

export default function FinancingApplyPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-bold text-brand-dark">
        Financing Partner Application
      </h1>
      <p className="mb-6 text-center text-sm text-gray-600">
        Apply to join the SturdiHome financing network. Once approved, you&apos;ll be
        able to log in and receive qualified financing referrals from homeowners.
      </p>
      <Card>
        <FinancingApplicationForm />
      </Card>
    </main>
  );
}
