import Link from "next/link";
import { Card } from "@/components/ui";
import PasswordForm from "@/components/PasswordForm";
export default function ForgotPasswordPage() {
  return <main className="mx-auto w-full max-w-md px-4 py-16">
    <h1 className="mb-3 text-2xl font-bold text-brand-navy">Forgot Password?</h1>
    <p className="mb-6 text-sm leading-6 text-gray-600">Enter your account email to receive a secure password-reset link.</p>
    <Card><PasswordForm /></Card>
    <Link href="/login" className="mt-5 block text-center text-brand underline">Back to Sign In</Link>
  </main>;
}
