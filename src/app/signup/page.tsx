import { Card } from "@/components/ui";
import SignupForm from "./SignupForm";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; referral?: string }> }) {
  const { next, referral } = await searchParams;
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-bold text-brand-dark">
        Create Your Homeowner Account
      </h1>
      <p className="mb-6 text-center text-sm text-gray-600">
        Create an account, then choose whether you want the full verified homeowner
        experience or vendor search only.
      </p>
      <Card>
        <SignupForm next={next} referralCode={referral} />
      </Card>
    </main>
  );
}
