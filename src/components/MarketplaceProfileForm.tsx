"use client";

import { useActionState } from "react";
import { saveMarketplaceListing } from "@/lib/actions/marketplace-actions";
import { CATEGORIES } from "@/lib/marketplace-shared";
import { SubmitButton } from "@/components/ui";

export type ListingFields = { companyName: string; description: string; services: string; areas: string[]; categories: string[]; website: string; email: string; phone: string; logo: string; photos: string[]; published: boolean };
export default function MarketplaceProfileForm({ initial, financing }: { initial: ListingFields; financing: boolean }) {
  const [state, action] = useActionState(saveMarketplaceListing, {});
  const field = "mt-2 block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm";
  return <form action={action} className="space-y-5">
    <p className="text-sm leading-6 text-gray-600">Only the details entered here are public when you publish. Add business contact information you want homeowners to use. Your account contact details stay separate.</p>
    {state.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
    {state.success && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{state.success}</p>}
    <label className="block text-sm font-medium">Public company name<input className={field} name="companyName" required maxLength={160} defaultValue={initial.companyName} /></label>
    <label className="block text-sm font-medium">Company description<textarea className={field} name="description" required minLength={20} maxLength={3000} rows={4} defaultValue={initial.description} /></label>
    <label className="block text-sm font-medium">{financing ? "Financing options you offer" : "Services offered"}<textarea className={field} name="services" required maxLength={2000} rows={3} defaultValue={initial.services} /></label>
    {!financing && <fieldset><legend className="text-sm font-medium">Service categories</legend><div className="mt-2 grid gap-3 sm:grid-cols-2">{CATEGORIES.map(c => <label key={c} className="flex items-center gap-2 text-sm"><input type="checkbox" name="categories" value={c} defaultChecked={initial.categories.includes(c)} />{c}</label>)}</div></fieldset>}
    <label className="block text-sm font-medium">Cities, states, and ZIP codes served<textarea className={field} name="areas" required rows={3} defaultValue={initial.areas.join("\n")} /><span className="mt-1 block text-xs font-normal text-gray-600">One area per line. Include individual ZIP codes so ZIP searches can find your listing. Search matches these entries; it does not calculate a radius.</span></label>
    <label className="block text-sm font-medium">Business website<input className={field} name="website" type="url" placeholder="https://your-company.com" defaultValue={initial.website} /></label>
    <label className="block text-sm font-medium">Public business email<input className={field} name="email" type="email" defaultValue={initial.email} /></label>
    <label className="block text-sm font-medium">Public business phone<input className={field} name="phone" type="tel" defaultValue={initial.phone} /></label>
    <label className="block text-sm font-medium">Logo image URL<input className={field} name="logo" type="url" placeholder="https://your-company.com/logo.png" defaultValue={initial.logo} /></label>
    <label className="block text-sm font-medium">Photo image URLs<textarea className={field} name="photos" rows={3} defaultValue={initial.photos.join("\n")} /><span className="mt-1 block text-xs font-normal text-gray-600">Up to eight public HTTPS image links, one per line. Use images you have permission to publish.</span></label>
    <label className="flex items-start gap-3 rounded-lg bg-brand-gold-pale/30 p-4 text-sm"><input className="mt-1" type="checkbox" name="published" defaultChecked={initial.published} /><span>Publish these business details in the member directory. Homeowners choose whether to contact me directly.</span></label>
    <SubmitButton>Save Public Listing</SubmitButton>
  </form>;
}
