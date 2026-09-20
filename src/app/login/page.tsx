import { Card } from "@/components/ui";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const { next, reset } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold text-brand-dark">Sign In</h1>
      <Card>
        {reset === "success" && <p role="status" className="mb-4 text-sm text-brand">Your password has been reset. Sign in with your new password.</p>}
        <LoginForm next={next} />
      </Card>
    </main>
  );
}
