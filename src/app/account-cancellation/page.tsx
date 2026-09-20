import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import AccountCancellationForm from "./AccountCancellationForm";

export default async function AccountCancellationPage() {
  const user = await getSessionUser();
  if (!user || user.role === "ADMIN") redirect("/login");
  return <main className="mx-auto w-full max-w-xl px-4 py-16"><Card><h1 className="text-2xl font-bold text-brand-navy">Cancel My Account</h1><p className="mt-3 text-sm leading-6 text-gray-600">Cancellation disables access while preserving signed agreements, audit history, completed referrals, security records, and other records required for lawful administration.</p><AccountCancellationForm /></Card></main>;
}
