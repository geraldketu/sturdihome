"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/ui";
import { refundBixyPaymentAction } from "@/lib/actions/bixy-payment-actions";

export default function RefundForm({ userId, paymentIntentId, originalCents, remainingCents }: { userId: string; paymentIntentId: string; originalCents: number; remainingCents: number }) {
  const [percentage, setPercentage] = useState("");
  const effective = Number(percentage);
  const amount = Number.isInteger(effective) && effective >= 1 && effective <= 100 ? Math.floor(originalCents * effective / 100) : 0;
  return <form action={refundBixyPaymentAction} className="space-y-2"><input type="hidden" name="userId" value={userId} /><input type="hidden" name="paymentIntentId" value={paymentIntentId} /><label className="block text-xs font-semibold">Refund percentage<select name="percentage" value={percentage} onChange={event => setPercentage(event.target.value)} required className="mt-1 block w-full rounded border p-2 text-sm text-gray-900"><option value="">Choose percentage</option>{[1,5,10,30,40,50,100].map(value => <option key={value} value={value} disabled={Math.floor(originalCents * value / 100) > remainingCents}>{value}%</option>)}</select></label><input name="customPercentage" type="number" min="1" max="100" step="1" value={percentage} onChange={event => setPercentage(event.target.value)} placeholder="Custom refund % (1-100)" className="w-full rounded border p-2 text-sm" />{amount > 0 && <p className="rounded bg-brand-gold-pale/30 p-2 text-xs font-semibold text-brand-navy">Refund amount: ${(amount / 100).toFixed(2)} · Remaining after: ${(Math.max(0, remainingCents - amount) / 100).toFixed(2)}</p>}<p className="text-xs text-gray-500">Choose a percentage, review the amount, then confirm.</p><SubmitButton pendingText="Processing Stripe refund...">Confirm Refund</SubmitButton></form>;
}
