"use client";
import { useActionState } from "react";
import { Field, FormError, SubmitButton } from "@/components/ui";
import { completeAccountSetupAction } from "@/lib/actions/account-setup-actions";
export default function SetupPasswordForm({ token }: { token: string }) { const [state, action] = useActionState(completeAccountSetupAction, undefined); return <form action={action} className="space-y-4"><FormError message={state?.error} /><input type="hidden" name="token" value={token} /><Field label="Create password" name="password" type="password" required placeholder="At least 8 characters" /><Field label="Confirm password" name="confirm" type="password" required /><SubmitButton pendingText="Setting up...">Create Password</SubmitButton></form>; }