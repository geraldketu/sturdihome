import { Card } from "@/components/ui";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-center text-2xl font-bold text-brand-dark">
        Create Your Homeowner Account
      </h1>
      <p className="mb-6 text-center text-sm text-gray-600">
        After creating an account you&apos;ll sign the member agreement and upload any
        required documents.
      </p>
      <Card>
        <SignupForm />
      </Card>
    </main>
  );
}
