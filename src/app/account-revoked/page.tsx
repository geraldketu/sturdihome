import Link from "next/link";
import { Card } from "@/components/ui";

export default function AccountRevokedPage() {
  return <main className="mx-auto w-full max-w-lg px-4 py-16"><Card><h1 className="text-xl font-bold text-brand-navy">Access Revoked</h1><p className="mt-3 text-sm leading-6 text-gray-600">SturdiHome access to this account has been revoked by an authorized administrator. Contact SturdiHome support if you need help.</p><Link href="/login" className="mt-5 inline-block font-semibold text-brand underline">Return to sign in</Link></Card></main>;
}