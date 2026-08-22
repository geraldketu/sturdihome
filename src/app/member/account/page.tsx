import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth-actions";
import { Card, SubmitButton } from "@/components/ui";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Account</h1>
        <p className="text-sm text-gray-600">Your account information.</p>
      </div>

      <Card>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Name</dt>
            <dd className="text-gray-900">{user.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-900">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Phone</dt>
            <dd className="text-gray-900">{user.phone ?? "N/A"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Member since</dt>
            <dd className="text-gray-900">{user.createdAt.toLocaleDateString()}</dd>
          </div>
        </dl>
      </Card>

      <form action={logoutAction}>
        <SubmitButton className="!bg-gray-700 hover:!bg-gray-800" pendingText="Logging out...">
          Log Out
        </SubmitButton>
      </form>
    </div>
  );
}
