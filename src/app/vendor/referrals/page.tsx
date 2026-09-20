import { redirect } from "next/navigation";
import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, SubmitButton } from "@/components/ui";
import { createVendorReferralAction } from "@/lib/actions/referral-actions";

export default async function VendorReferralsPage() {
  const user = await requirePageAccess("/vendor/referrals");
  if (!user) redirect("/login");
  const referrals = await prisma.vendorReferral.findMany({ where: { vendorUserId: user.id }, orderBy: { createdAt: "desc" } });
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-brand-dark">Customer Referrals</h1><p className="mt-1 text-sm text-gray-600">Share a link. You will only see whether the customer created an account, never private financing information.</p></div><Card><form action={createVendorReferralAction}><SubmitButton pendingText="Creating...">Create Referral Link</SubmitButton></form></Card><Card><h2 className="mb-3 font-semibold text-gray-900">Referral status</h2>{referrals.map(referral => <div key={referral.id} className="border-b border-gray-100 py-3 text-sm"><p className="font-medium">{referral.status}</p><p className="mt-1 break-all text-gray-600">https://sturdyhomenetwork.com/signup?referral={referral.code}</p></div>)}{!referrals.length && <p className="text-sm text-gray-500">No referral links created.</p>}</Card></div>;
}