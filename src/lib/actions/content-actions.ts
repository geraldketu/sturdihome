"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { putPublicMedia } from "@/lib/media-blob-storage";
import { UploadValidationError, validatePublicMedia } from "@/lib/upload-validation";

async function admin() { const user = await getSessionUser(); if (!user || user.role !== "ADMIN") throw new Error("Not authorized"); return user; }
const value = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
export type MediaUploadState = { error?: string; url?: string; mediaType?: "image" | "video" } | undefined;

export async function uploadMediaAction(_previous: MediaUploadState, form: FormData): Promise<MediaUploadState> {
	const adminUser = await admin();
	const file = form.get("file");
	if (!(file instanceof File) || !file.size) return { error: "Choose an image or video file first." };
	try {
		const bytes = await validatePublicMedia(file);
		const pathname = `media/${adminUser.id}/${randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120)}`;
		const blob = await putPublicMedia(pathname, bytes, file.type);
		return { url: blob.url, mediaType: file.type.startsWith("video/") ? "video" : "image" };
	} catch (error) {
		return { error: error instanceof UploadValidationError ? error.message : "The media file could not be uploaded." };
	}
}

export async function saveServiceCategoryAction(form: FormData): Promise<void> { await admin(); const id=value(form,"id"); const label=value(form,"label"); if(!label)return; const data={label,slug:value(form,"slug")||label.toLowerCase().replace(/[^a-z0-9]+/g,"-"),description:value(form,"description"),imageUrl:value(form,"imageUrl"),active:form.get("active")==="on",sortOrder:Number(form.get("sortOrder")||0)}; if(id) await prisma.serviceCategory.update({where:{id},data}); else await prisma.serviceCategory.create({data}); revalidatePath("/admin/services"); revalidatePath("/services"); }
export async function saveAnnouncementAction(form: FormData): Promise<void> { await admin(); const id=value(form,"id"); const parseDate=(name:string)=>{const raw=value(form,name); return raw?new Date(raw):null;}; const data={title:value(form,"title"),body:value(form,"body"),ctaLabel:value(form,"ctaLabel")||null,ctaHref:value(form,"ctaHref")||null,startsAt:parseDate("startsAt"),endsAt:parseDate("endsAt"),active:form.get("active")==="on",sortOrder:Number(form.get("sortOrder")||0)}; if(!data.title||!data.body)return; if(id) await prisma.siteAnnouncement.update({where:{id},data}); else await prisma.siteAnnouncement.create({data}); revalidatePath("/admin/announcements"); revalidatePath("/", "layout"); }
export async function savePageAction(form: FormData): Promise<void> { await admin(); const slug=value(form,"slug"); const title=value(form,"title"); const body=value(form,"body"); if(!slug||!title||!body)return; await prisma.siteContentPage.upsert({where:{slug},update:{title,body,published:form.get("published")==="on"},create:{slug,title,body,published:form.get("published")==="on"}}); revalidatePath(`/pages/${slug}`); revalidatePath("/admin/pages"); }
export async function saveNavigationAction(form: FormData): Promise<void> { await admin(); const label=value(form,"label"); const href=value(form,"href"); if(!label||!href)return; await prisma.siteNavigationItem.create({data:{label,href,visible:form.get("visible")==="on",sortOrder:Number(form.get("sortOrder")||0)}}); revalidatePath("/", "layout"); }
export async function saveMediaAction(form: FormData): Promise<void> { await admin(); const label=value(form,"label"); const sourceUrl=value(form,"sourceUrl"); if(!label||!sourceUrl)return; await prisma.siteMediaAsset.create({data:{label,sourceUrl,mediaType:value(form,"mediaType")||"image",altText:value(form,"altText"),description:value(form,"description"),published:form.get("published")==="on"}}); revalidatePath("/admin/media"); revalidatePath("/"); }
