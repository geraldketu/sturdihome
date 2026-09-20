"use client";

import { useEffect, useRef } from "react";

export default function HomepageHeroSlider() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    video.muted = true;
    void video.play().catch(() => undefined);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <video ref={videoRef} className="h-full w-full object-cover" src="/videos/bixy-video.mp4" autoPlay controls muted playsInline preload="metadata" aria-label="SturdiHome homepage video" />
    </div>
  );
}
