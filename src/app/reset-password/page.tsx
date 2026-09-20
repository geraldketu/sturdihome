import Link from "next/link";
import { Card } from "@/components/ui";
import PasswordForm from "@/components/PasswordForm";
export const metadata = { referrer: "no-referrer" as const, robots: { index: false, follow: false } };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <main className="mx-auto w-full max-w-md px-4 py-16">
    <h1 className="mb-6 text-2xl font-bold text-brand-navy">Reset Your Password</h1>
    <Card>{typeof token === "string" && /^[a-f0-9]{64}$/.test(token) ? <PasswordForm token={token} /> : <p>That reset link is invalid. <Link href="/forgot-password" className="text-brand underline">Request a new link</Link>.</p>}</Card>
  </main>;
}
