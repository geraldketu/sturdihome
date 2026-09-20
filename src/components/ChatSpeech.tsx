"use client";

import { useEffect } from "react";
import { CHARACTER_VOICES } from "@/lib/character-config";

/** Dynamic TTS is intentionally unavailable until a real server-side voice provider is configured. */
export default function ChatSpeech({ character = "sturdiGirl", resetToken = 0, onSpeakingChange }: { text: string; character?: "sturdiGirl" | "brixy"; resetToken?: number; onSpeakingChange?: (speaking: boolean) => void }) {

  useEffect(() => {
    onSpeakingChange?.(false);
  }, [onSpeakingChange, resetToken]);

  return (
    <div className="shrink-0 border-t border-brand-gold/30 bg-brand-gold-pale/20 px-3 py-2">
      <p role="status" className="text-xs text-gray-600">
        Dynamic voice is not configured yet. {CHARACTER_VOICES[character].label}&apos;s answer is shown here as text.
      </p>
    </div>
  );
}
