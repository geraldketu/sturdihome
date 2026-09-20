"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function HomepageHeroSlider() {
  const [slide, setSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    video.muted = true;
    if (slide === 0) void video.play().catch(() => undefined);
  }, [slide]);

  function showSlide(nextSlide: number) {
    setSlide((nextSlide + 2) % 2);
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <div className={`absolute inset-0 transition-opacity duration-300 ${slide === 0 ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={slide !== 0}>
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src="/videos/vendor-marketing.mp4"
          autoPlay
          controls
          muted
          playsInline
          preload="metadata"
          aria-label="SturdiHome homepage video"
        />
      </div>
      <div className={`absolute inset-0 transition-opacity duration-300 ${slide === 1 ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={slide !== 1}>
        <Image src="/images/sturdi-girl.png" alt="Sturdi Girl, the SturdiHome guide" fill priority={false} className="object-contain" sizes="100vw" />
      </div>
      <button type="button" onClick={() => showSlide(slide - 1)} aria-label="Show previous hero slide" className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-3xl leading-none text-white hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6">
        <span aria-hidden="true">‹</span>
      </button>
      <button type="button" onClick={() => showSlide(slide + 1)} aria-label="Show next hero slide" className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-3xl leading-none text-white hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6">
        <span aria-hidden="true">›</span>
      </button>
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2" aria-label="Hero slides">
        {[0, 1].map((slideNumber) => <button key={slideNumber} type="button" onClick={() => setSlide(slideNumber)} aria-label={`Show hero slide ${slideNumber + 1}`} aria-current={slide === slideNumber} className={`h-2.5 w-2.5 rounded-full border border-white ${slide === slideNumber ? "bg-white" : "bg-white/35"}`} />)}
      </div>
    </div>
  );
}
