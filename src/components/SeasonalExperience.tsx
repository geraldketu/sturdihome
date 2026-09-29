"use client";

import { useEffect, useState } from "react";

export default function SeasonalExperience({ children }: { children: React.ReactNode; initialSettings?: unknown }) {
  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [assetKind, setAssetKind] = useState<"image" | "video" | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/seasonal-effect", { cache: "no-store" }).then(response => {
      if (response.status === 204 || !response.ok) return null;
      const kind: "image" | "video" = response.headers.get("content-type")?.startsWith("video/") ? "video" : "image";
      return response.blob().then(blob => ({ kind, url: URL.createObjectURL(blob) }));
    }).then(result => {
      if (cancelled || !result) return;
      setAssetKind(result.kind); setAssetUrl(result.url);
    }).catch(() => undefined);
    return () => { cancelled = true; setAssetUrl(current => { if (current) URL.revokeObjectURL(current); return null; }); };
  }, []);

  return <div className="seasonal-experience">{assetUrl && <div className="seasonal-custom-effect" aria-hidden="true">{assetKind === "video" ? <video src={assetUrl} autoPlay loop muted playsInline /> : <img src={assetUrl} alt="" />}</div>}{children}</div>;
}
