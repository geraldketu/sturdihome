"use client";

import { useEffect } from "react";
import { CHARACTER_VOICES } from "@/lib/character-config";

export default function ChatSpeech({ text, character = "brixy", enabled = false, resetToken = 0, onSpeakingChange }: { text: string; character?: "brixy"; enabled?: boolean; resetToken?: number; onSpeakingChange?: (speaking: boolean) => void }) {

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.speechSynthesis) {
      onSpeakingChange?.(false);
      return;
    }

    const synthesis = window.speechSynthesis;
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceConfig = CHARACTER_VOICES[character];
    const voices = synthesis.getVoices();
    utterance.voice = voices.find((voice) => /\bmale\b|david|daniel|george|alex|guy|google uk english male/i.test(voice.name)) ?? voices.find((voice) => voice.lang.startsWith("en")) ?? null;
    utterance.rate = voiceConfig.rate;
    utterance.pitch = voiceConfig.pitch;
    utterance.onstart = () => onSpeakingChange?.(true);
    utterance.onend = () => onSpeakingChange?.(false);
    utterance.onerror = () => onSpeakingChange?.(false);
    synthesis.speak(utterance);

    return () => {
      synthesis.cancel();
      onSpeakingChange?.(false);
    };
  }, [character, enabled, onSpeakingChange, resetToken, text]);

  return (
    <div className="shrink-0 border-t border-brand-gold/30 bg-brand-gold-pale/20 px-3 py-2">
      <p role="status" className="text-xs text-gray-600">
        {enabled ? `${CHARACTER_VOICES[character].label} is speaking.` : `${CHARACTER_VOICES[character].label}&apos;s answer is shown here as text.`}
      </p>
    </div>
  );
}
