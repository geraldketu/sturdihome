"use client";

import CharacterStage from "@/components/CharacterStage";

type Character = "brixy";

export default function CharacterInteractionPanel({ activeCharacter, motion = "idle", gesture = "idle", onSelect }: { activeCharacter: Character | null; motion?: "idle" | "speaking" | "listening"; gesture?: "idle" | "point-left" | "point-right"; onSelect: (character: Character) => void }) {
  return (
    <section className="character-interaction-panel border-b border-brand-gold/30 bg-brand-gold-pale/15 p-3" aria-label="Character interaction panel">
      {!activeCharacter ? (
        <>
          <h2 className="text-sm font-semibold text-brand-navy">Meet Bixy</h2>
          <p className="mt-1 text-xs text-gray-600">Start a conversation with your SturdiHome guide.</p>
          <button type="button" onClick={() => onSelect("brixy")} className="mt-3 flex min-h-24 w-full flex-col items-center justify-center rounded-md border border-brand-navy/15 bg-white px-2 py-2 text-xs font-semibold text-brand-navy hover:bg-brand-gold-pale/30">
            <CharacterStage character="brixy" className="character-stage-static h-14 w-12 overflow-hidden rounded-md" />
            <span className="mt-1">Interact with Bixy</span>
          </button>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <CharacterStage character={activeCharacter} motion={motion} gesture={gesture} specialSceneAudio={motion === "speaking"} className="h-24 w-20 overflow-hidden rounded-md" />
          <div>
            <p className="text-sm font-semibold text-brand-navy">Bixy is ready to chat.</p>
            <p className="mt-1 text-xs text-gray-600">Your character stays contained inside this AI experience.</p>
          </div>
        </div>
      )}
    </section>
  );
}
