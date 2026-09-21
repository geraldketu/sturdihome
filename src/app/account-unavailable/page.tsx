import Link from "next/link";
import { Card } from "@/components/ui";

export default function AccountUnavailablePage() {
  return <main className="mx-auto w-full max-w-lg px-4 py-16"><Card><h1 className="text-xl font-bold text-brand-navy">Account Temporarily Unavailable</h1><p className="mt-3 text-sm leading-6 text-gray-600">Access to this account is temporarily unavailable while SturdiHome reviews its status. Contact SturdiHome support if you need help.</p><Link href="/login" className="mt-5 inline-block font-semibold text-brand underline">Return to sign in</Link></Card></main>;
}