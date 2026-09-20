"use client";

import CharacterStage from "@/components/CharacterStage";

type Character = "sturdiGirl" | "brixy";

export default function CharacterInteractionPanel({ activeCharacter, onSelect }: { activeCharacter: Character | null; onSelect: (character: Character) => void }) {
  return (
    <section className="character-interaction-panel border-b border-brand-gold/30 bg-brand-gold-pale/15 p-3" aria-label="Character interaction panel">
      {!activeCharacter ? (
        <>
          <h2 className="text-sm font-semibold text-brand-navy">Choose your SturdiHome guide</h2>
          <p className="mt-1 text-xs text-gray-600">Select a character to start your conversation.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onSelect("sturdiGirl")} className="flex min-h-24 flex-col items-center justify-center rounded-md border border-brand-navy/15 bg-white px-2 py-2 text-xs font-semibold text-brand-navy hover:bg-brand-gold-pale/30">
              <CharacterStage character="sturdiGirl" className="character-stage-static h-14 w-12 overflow-hidden rounded-md" />
              <span className="mt-1">Interact with Sturdi Girl</span>
            </button>
            <button type="button" onClick={() => onSelect("brixy")} className="flex min-h-24 flex-col items-center justify-center rounded-md border border-brand-navy/15 bg-white px-2 py-2 text-xs font-semibold text-brand-navy hover:bg-brand-gold-pale/30">
              <CharacterStage character="brixy" className="character-stage-static h-14 w-12 overflow-hidden rounded-md" />
              <span className="mt-1">Interact with Brixy</span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3">
          <CharacterStage character={activeCharacter} className="character-stage-static h-24 w-20 overflow-hidden rounded-md" />
          <div>
            <p className="text-sm font-semibold text-brand-navy">{activeCharacter === "sturdiGirl" ? "Sturdi Girl" : "Brixy"} is ready to chat.</p>
            <p className="mt-1 text-xs text-gray-600">Your character stays contained inside this AI experience.</p>
          </div>
        </div>
      )}
    </section>
  );
}
