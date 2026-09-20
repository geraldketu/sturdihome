import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/lib/auth";
import { roleHome, safeReturnTo, welcomeCopy } from "@/lib/access";
import LoginWelcome from "@/components/LoginWelcome";
import { createHash } from "node:crypto";

export default async function WelcomePage() {
  const session = await getAuthenticatedSession();
  if (!session) redirect("/login");
  if (!session.welcomePending) redirect(safeReturnTo(session.returnTo, session.user.role) ?? roleHome(session.user.role));
  const copy = welcomeCopy(session.user.role, session.user.name, session.firstLogin);
  return <LoginWelcome {...copy} role={session.user.role} welcomeKey={createHash("sha256").update(session.id).digest("hex")} />;
}
