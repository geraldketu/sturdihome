import { Card } from "@/components/ui";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold text-brand-dark">Log In</h1>
      <Card>
        <LoginForm next={next} />
      </Card>
    </main>
  );
}
