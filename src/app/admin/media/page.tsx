import { requirePageAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";
import MediaUploadForm from "./MediaUploadForm";
export default async function AdminMediaPage(){await requirePageAccess("/admin/media");const assets=await prisma.siteMediaAsset.findMany({orderBy:{createdAt:"desc"}});return <div className="space-y-6"><h1 className="text-2xl font-bold text-brand-dark">Media Library</h1><p className="text-sm text-gray-600">Public website media is separate from private application documents and vendor flyers.</p><Card><MediaUploadForm /></Card>{assets.map(asset=><Card key={asset.id}><p className="font-semibold">{asset.label}</p><p className="text-xs text-gray-500">{asset.mediaType} · {asset.published?"Published":"Draft"}</p><a className="mt-1 block break-all text-sm text-brand underline" href={asset.sourceUrl}>{asset.sourceUrl}</a></Card>)}</div>}
