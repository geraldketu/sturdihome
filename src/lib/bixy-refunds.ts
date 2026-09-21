export function validateRefundPercentage(value: unknown) {
  const percentage = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(percentage) || percentage < 1 || percentage > 100) throw new Error("Refund percentage must be a whole number from 1 through 100.");
  return percentage;
}

export function calculateRefundCents(originalAmountCents: number, percentage: unknown) {
  const validPercentage = validateRefundPercentage(percentage);
  if (!Number.isInteger(originalAmountCents) || originalAmountCents <= 0) throw new Error("Invalid original payment amount.");
  return { percentage: validPercentage, amountCents: Math.floor(originalAmountCents * validPercentage / 100) };
}

export function refundableBalanceCents(amountReceivedCents: number, refunds: number[]) {
  return Math.max(0, amountReceivedCents - refunds.reduce((sum, amount) => sum + Math.max(0, amount), 0));
}