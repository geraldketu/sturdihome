export function resetEmailConfigured() {
  try {
    const base = new URL(process.env.APP_BASE_URL ?? "");
    return !!process.env.RESEND_API_KEY && !!process.env.PASSWORD_RESET_FROM && !/[\r\n]/.test(process.env.PASSWORD_RESET_FROM) && !base.username && !base.password &&
      (base.protocol === "https:" || (process.env.NODE_ENV !== "production" && base.protocol === "http:" && ["localhost", "127.0.0.1"].includes(base.hostname)));
  } catch { return false; }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!resetEmailConfigured()) throw new Error("Password reset email is not configured");
  const base = new URL(process.env.APP_BASE_URL!);
  if (base.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(base.hostname)) throw new Error("HTTPS required");
  const url = new URL("/reset-password", base);
  url.searchParams.set("token", token);
  // Local test adapter cannot be enabled in a production build.
  const testEndpoint = process.env.NODE_ENV !== "production" ? process.env.LOCAL_RESET_EMAIL_ENDPOINT : undefined;
  if (testEndpoint && !/^http:\/\/127\.0\.0\.1:\d+\/emails$/.test(testEndpoint)) throw new Error("Invalid local email endpoint");
  const response = await fetch(testEndpoint ?? "https://api.resend.com/emails", {
    redirect: "error",
    method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.PASSWORD_RESET_FROM, to: [email], subject: "Reset your SturdiHome password",
      text: `Use this link to reset your SturdiHome password: ${url}\n\nThis link expires in 30 minutes and can only be used once. If you did not request a reset, you can ignore this email.`,
    }), signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Password reset email delivery failed");
}

export async function sendAccountSetupEmail(email: string, token: string) {
  if (!resetEmailConfigured()) throw new Error("Account setup email is not configured");
  const base = new URL(process.env.APP_BASE_URL!);
  const url = new URL("/account-setup", base);
  url.searchParams.set("token", token);
  const testEndpoint = process.env.NODE_ENV !== "production" ? process.env.LOCAL_RESET_EMAIL_ENDPOINT : undefined;
  if (testEndpoint && !/^http:\/\/127\.0\.0\.1:\d+\/emails$/.test(testEndpoint)) throw new Error("Invalid local email endpoint");
  const response = await fetch(testEndpoint ?? "https://api.resend.com/emails", { redirect: "error", method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.PASSWORD_RESET_FROM, to: [email], subject: "Your SturdiHome account has been approved", text: `Your SturdiHome account has been approved. Use this secure link to create your password: ${url}\n\nThis link expires in 48 hours and can only be used once.` }), signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Account setup email delivery failed");
}
