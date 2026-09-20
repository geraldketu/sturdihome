"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CHARACTER_TALKING_VIDEO_AVAILABLE } from "@/lib/character-config";

type Character = "brixy";
export type CharacterMotion = "hidden" | "enter" | "walk-left" | "walk-right" | "move-to-target" | "idle" | "speaking" | "listening" | "point-left" | "point-right" | "point-up" | "point-down" | "surprised" | "happy" | "thinking" | "return-home" | "exit";

const assets = {
  brixy: { image: "/images/bixy-official.png", video: "/videos/brixy-talking.mp4", label: "Brixy" },
} as const;

export default function CharacterStage({ character, motion = "idle", className = "", specialSceneAudio = false, playEmbeddedAudio = false, resetToken = 0, onEmbeddedAudioState }: { character: Character; motion?: CharacterMotion; className?: string; specialSceneAudio?: boolean; playEmbeddedAudio?: boolean; resetToken?: number; onEmbeddedAudioState?: (state: "loading" | "ready" | "failed") => void }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const asset = assets[character];
  const animated = motion === "speaking" && !videoFailed;
  useEffect(() => { const video = videoRef.current; if (video) { video.pause(); video.currentTime = 0; video.muted = true; } if (specialSceneAudio && animated && playEmbeddedAudio) onEmbeddedAudioState?.("loading"); }, [resetToken, specialSceneAudio, animated, playEmbeddedAudio, onEmbeddedAudioState]);
  return <div className={`character-stage character-stage-${character} character-motion-${motion} ${className}`} data-character={character} data-motion={motion} aria-label={`${asset.label} ${motion}`}>
    {!videoFailed && specialSceneAudio && CHARACTER_TALKING_VIDEO_AVAILABLE[character] && <video ref={videoRef} key={asset.video} aria-hidden="true" className="character-stage-video" src={asset.video} poster={asset.image} autoPlay={animated} loop muted={!playEmbeddedAudio || !animated} playsInline onCanPlay={(event) => { if (specialSceneAudio && animated && playEmbeddedAudio) { event.currentTarget.muted = false; onEmbeddedAudioState?.("ready"); } }} onError={() => { setVideoFailed(true); onEmbeddedAudioState?.("failed"); }} />}
    <Image src={asset.image} alt={asset.label} width={180} height={180} className="character-stage-image" />
    <span className="character-stage-eyeline" aria-hidden="true" />
  </div>;
}
