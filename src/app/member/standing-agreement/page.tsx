import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { getMemberStandingAcceptance, MEMBER_STANDING_CONTENT, MEMBER_STANDING_EFFECTIVE_DATE, MEMBER_STANDING_VERSION } from "@/lib/member-standing";
import StandingAgreementForm from "./StandingAgreementForm";

export default async function MemberStandingAgreementPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "HOMEOWNER") redirect("/login");
  const accepted = await getMemberStandingAcceptance(user.id);
  return <div className="max-w-2xl space-y-6"><div><h1 className="text-2xl font-bold text-brand-dark">Member Account Standing and Platform Access Agreement</h1><p className="text-sm text-gray-600">Effective {MEMBER_STANDING_EFFECTIVE_DATE.toLocaleDateString()} · Version {MEMBER_STANDING_VERSION}</p></div><Card><div className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-md border border-gray-100 bg-gray-50 p-4 text-sm leading-6 text-gray-700">{MEMBER_STANDING_CONTENT}</div>{accepted ? <p className="mt-4 text-sm text-green-700">Accepted electronically on {accepted.acceptedAt.toLocaleString()}. Your signed copy is preserved in My Documents.</p> : <StandingAgreementForm />}</Card></div>;
}
