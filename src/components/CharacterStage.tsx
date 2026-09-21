"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CHARACTER_TALKING_VIDEO_AVAILABLE } from "@/lib/character-config";
import { useSeasonalTheme } from "@/components/SeasonalExperience";

type Character = "brixy";
export type CharacterMotion = "hidden" | "enter" | "walk-left" | "walk-right" | "move-to-target" | "idle" | "speaking" | "listening" | "point-left" | "point-right" | "point-up" | "point-down" | "surprised" | "happy" | "thinking" | "return-home" | "exit";
type CharacterGesture = "idle" | "point-left" | "point-right";

const assets = {
  brixy: { image: "/images/bixy-official.png", video: "/videos/brixy-talking.mp4", label: "Brixy" },
} as const;

export default function CharacterStage({ character, motion = "idle", gesture = "idle", className = "", specialSceneAudio = false, playEmbeddedAudio = false, resetToken = 0, onEmbeddedAudioState }: { character: Character; motion?: CharacterMotion; gesture?: CharacterGesture; className?: string; specialSceneAudio?: boolean; playEmbeddedAudio?: boolean; resetToken?: number; onEmbeddedAudioState?: (state: "loading" | "ready" | "failed") => void }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const asset = assets[character];
  const animated = motion === "speaking" && !videoFailed;
  const { season, holiday, settings } = useSeasonalTheme();
  useEffect(() => { const video = videoRef.current; if (video) { video.pause(); video.currentTime = 0; video.muted = true; } if (specialSceneAudio && animated && playEmbeddedAudio) onEmbeddedAudioState?.("loading"); }, [resetToken, specialSceneAudio, animated, playEmbeddedAudio, onEmbeddedAudioState]);
  return <div className={`character-stage character-stage-${character} character-motion-${motion} character-gesture-${gesture} ${className}`} data-character={character} data-motion={motion} data-gesture={gesture} aria-label={`${asset.label} ${motion}`}>
    {!videoFailed && specialSceneAudio && CHARACTER_TALKING_VIDEO_AVAILABLE[character] && <video ref={videoRef} key={asset.video} aria-hidden="true" className="character-stage-video" src={asset.video} poster={asset.image} autoPlay={animated} loop muted={!playEmbeddedAudio || !animated} playsInline onCanPlay={(event) => { if (specialSceneAudio && animated && playEmbeddedAudio) { event.currentTarget.muted = false; onEmbeddedAudioState?.("ready"); } }} onError={() => { setVideoFailed(true); onEmbeddedAudioState?.("failed"); }} />}
    <Image src={asset.image} alt={asset.label} width={180} height={180} className="character-stage-image" />
    {character === "brixy" && !settings.effectsDisabled && <span className={`bixy-accessory bixy-accessory-${holiday ?? season}`} aria-hidden="true"><span className="bixy-accessory-hat" /><span className="bixy-accessory-scarf" /><span className="bixy-accessory-bow" /></span>}
    <span className="character-stage-eyeline" aria-hidden="true" />
  </div>;
}
