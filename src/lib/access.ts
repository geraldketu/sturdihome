export const ROLES = ["HOMEOWNER", "VENDOR", "FINANCING_PARTNER", "ADMIN"] as const;
export function roleHome(role: string): string {
  return ({ HOMEOWNER: "/member", VENDOR: "/vendor", FINANCING_PARTNER: "/financing", ADMIN: "/admin" } as Record<string, string>)[role] ?? "/";
}
export function routeRoles(pathname: string): readonly string[] | null {
  for (const [prefix, roles] of [
    ["/member", ["HOMEOWNER", "ADMIN"]], ["/vendor", ["VENDOR", "ADMIN"]],
    ["/financing", ["FINANCING_PARTNER", "ADMIN"]], ["/admin", ["ADMIN"]],
    ["/marketplace", ROLES], ["/welcome", ROLES], ["/pending-approval", ROLES], ["/agreement", ROLES], ["/account-cancelled", ROLES], ["/account-cancellation", ROLES],
  ] as const) if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return roles;
  return null;
}
// Only known internal destinations; never external URLs, API calls or auth loops.
export function safeReturnTo(value: unknown, role?: string): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return null;
  try {
    const url = new URL(value, "https://sturdihome.invalid");
    if (url.origin !== "https://sturdihome.invalid" || /%2f|%5c|%00/i.test(url.pathname)) return null;
    const roles = routeRoles(url.pathname);
    if (!roles || ["/welcome", "/pending-approval", "/agreement"].includes(url.pathname)) return null;
    if (url.pathname.startsWith("/marketplace/financing") && role === "VENDOR") return null;
    if (role && !roles.includes(role)) return null;
    return url.pathname + url.search + url.hash;
  } catch { return null; }
}
export function joinUrl(next: string) {
  const safe = safeReturnTo(next);
  return safe ? `/join-network?next=${encodeURIComponent(safe)}` : "/join-network";
}
export function welcomeCopy(role: string, name: string, first: boolean) {
  const label = ({ HOMEOWNER: "Member", VENDOR: "Vendor", FINANCING_PARTNER: "Finance Partner", ADMIN: "Administrator" } as Record<string, string>)[role] ?? "Member";
  const firstName = name.trim().split(/\s+/)[0];
  return {
    title: first ? "Welcome to SturdiHome! ❤️" : `Welcome Back, ${firstName || label}! ❤️`,
    message: first
      ? ({ HOMEOWNER: "We're happy to welcome you as a SturdiHome member.", VENDOR: "We're happy to welcome you as a vendor in the SturdiHome Network.", FINANCING_PARTNER: "We're happy to welcome you as a finance partner in the SturdiHome Network." } as Record<string, string>)[role] ?? "We're happy to welcome you to SturdiHome."
      : role === "HOMEOWNER" ? "We're happy to have you back at SturdiHome." : "We're happy to have you back in the SturdiHome Network.",
  };
}
