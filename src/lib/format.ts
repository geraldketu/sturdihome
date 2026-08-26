export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function formatCentsRange(lowCents: number, highCents: number): string {
  return `${formatCents(lowCents)} – ${formatCents(highCents)}`;
}
