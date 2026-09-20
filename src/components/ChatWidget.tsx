"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ChatSpeech from "@/components/ChatSpeech";
import CharacterStage from "@/components/CharacterStage";
import CharacterInteractionPanel from "@/components/CharacterInteractionPanel";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { CHARACTER_PLANS } from "@/lib/character-config";
import { createCharacterCheckoutAction } from "@/lib/actions/billing-actions";

type Character = "brixy";
type Status = { freeSecondsRemaining: number; paidSecondsRemaining: number; expiresAt: string | Date | null; hasAccess: boolean };

const GREETINGS: Record<Character, string> = {
  brixy: "Well hello there. I am Bixy, your dependable SturdiHome guide. I will keep an eye on the details and help you find the right next step.",
};
const QUICK_LINKS = [
  { href: "/signup", label: "Join as a homeowner" },
  { href: "/apply/vendor", label: "Apply as a vendor" },
  { href: "/apply/financing", label: "Apply as a financing partner" },
];
const GUIDE_CHOICES = [
  ["I need home services", "/marketplace/vendors"],
  ["I want to become a vendor", "/apply/vendor"],
  ["I need financing information", "/marketplace/financing"],
  ["I am a financing partner", "/apply/financing"],
  ["Show me pricing", "/financing/membership"],
  ["Show me my account", "/member/account"],
  ["Show me my appointments", "/member/appointments"],
  ["Show me my documents", "/member/documents"],
  ["How does SturdiHome work?", "/how-it-works"],
] as const;

function UsageStatus({ status }: { status: Status | null }) {
  if (!status) return null;
  return <p className="text-[11px] text-white/70" aria-label="Character usage">{status.freeSecondsRemaining}s free - {Math.floor(status.paidSecondsRemaining / 60)}m paid{status.expiresAt ? ` - expires ${new Date(status.expiresAt).toLocaleDateString()}` : ""}</p>;
}

function PurchaseOptions({ enabled }: { enabled: boolean }) {
  return <div className="space-y-2 border-t border-gray-200 p-3 text-xs">
    <p className="font-semibold text-brand-navy">Your free guide time is used. Choose prepaid access to continue.</p>
    {Object.values(CHARACTER_PLANS).map((plan) => <form key={plan.id} action={createCharacterCheckoutAction}>
      <input type="hidden" name="plan" value={plan.id} />
      <button type="submit" disabled={!enabled} className="flex w-full items-center justify-between rounded-md border border-brand-gold/50 bg-brand-gold-pale/30 px-3 py-2 text-left font-semibold text-brand-navy disabled:cursor-not-allowed disabled:opacity-50">
        <span>{plan.name}<small className="ml-2 font-normal text-gray-600">{plan.blurb}</small></span><span>${(plan.amountCents / 100).toFixed(2)}</span>
      </button>
    </form>)}
    {!enabled && <p className="text-gray-500">Paid character access is pending final review.</p>}
  </div>;
}

export default function ChatWidget({ authenticated = false, initialStatus = null, paymentsEnabled = false }: { authenticated?: boolean; initialStatus?: Status | null; paymentsEnabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"compact" | "expanded">("compact");
  const [input, setInput] = useState("");
  const [character, setCharacter] = useState<Character>("brixy");
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [speechResetToken, setSpeechResetToken] = useState(0);
  const [status, setStatus] = useState<Status | null>(initialStatus);
  const [intro, setIntro] = useState(() => typeof window !== "undefined" && window.localStorage.getItem("sturdihome-character-intro-seen") !== "1");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, status: chatStatus, error } = useChat<UIMessage>({ transport: new DefaultChatTransport({ api: "/api/chat" }), messages: [{ id: "greeting", role: "assistant", parts: [{ type: "text", text: GREETINGS.brixy }] }] });
  const busy = chatStatus === "submitted" || chatStatus === "streaming";
  const latestReply = messages.findLast((message) => message.role === "assistant");
  const speechText = latestReply?.parts.filter((part) => part.type === "text").map((part) => part.text).join("\n") ?? "";

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, chatStatus]);
  useEffect(() => { if (authenticated) void fetch("/api/character/status", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((next) => next && setStatus(next)).catch(() => undefined); }, [authenticated]);
  useEffect(() => { if (authenticated && chatStatus === "ready") void fetch("/api/character/status", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((next) => next && setStatus(next)).catch(() => undefined); }, [authenticated, chatStatus]);

  function dismissIntro() { window.localStorage.setItem("sturdihome-character-intro-seen", "1"); setIntro(false); }
  function handleSubmit(event: React.FormEvent) { event.preventDefault(); if (!authenticated || busy || !input.trim()) return; sendMessage({ text: input.trim() }, { body: { character } }); setInput(""); }
  function interactWith(nextCharacter: Character) { setSpeechResetToken((value) => value + 1); setCharacter(nextCharacter); setActiveCharacter(nextCharacter); }
  function stopInteraction(nextCharacter: Character) { if (activeCharacter === nextCharacter) { setSpeechResetToken((value) => value + 1); setActiveCharacter(null); } }

  return <div className="character-widget fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
    {open && <div className={`character-panel character-panel-${panelMode} flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl`}>
        <div className="flex items-center justify-between bg-brand-navy px-4 py-3">
          <div className="flex items-center gap-2">{activeCharacter && <CharacterStage character={character} className="character-stage-static h-10 w-10 overflow-hidden rounded-full border border-brand-gold" />}<div><p className="text-sm font-semibold text-white">{activeCharacter ? "Bixy" : "Choose Bixy"}</p><p className="text-xs text-brand-gold-pale">{activeCharacter ? "Your guide" : "Start inside the AI experience"}</p><UsageStatus status={status} /></div></div>
        <div className="flex items-center gap-2"><button type="button" onClick={() => setPanelMode(panelMode === "expanded" ? "compact" : "expanded")} aria-label={panelMode === "expanded" ? "Minimize character chat" : "Expand character chat"} className="rounded px-2 py-1 text-xs font-semibold text-white/90 hover:bg-white/10">{panelMode === "expanded" ? "Minimize" : "Expand"}</button><button type="button" onClick={() => { setOpen(false); setPanelMode("compact"); stopInteraction(character); }} aria-label="Close character chat" className="text-xl text-white/80 hover:text-white">x</button></div>
      </div>
      <CharacterInteractionPanel activeCharacter={activeCharacter} onSelect={interactWith} />
      <div className="space-y-1 px-3 pt-3"><button type="button" onClick={() => interactWith("brixy")} className="w-full rounded-md bg-brand-navy px-2 py-2 text-xs font-semibold text-white">Interact with Bixy</button>{activeCharacter === "brixy" && <button type="button" onClick={() => stopInteraction("brixy")} className="w-full rounded-md border border-brand-navy/20 px-2 py-1.5 text-xs font-semibold text-brand-navy">Stop Bixy</button>}</div>
      {activeCharacter && <div className="mx-3 mt-3 rounded-md border border-brand-gold/40 bg-brand-gold-pale/15 p-2"><p className="mb-2 text-xs font-semibold text-brand-navy">Bixy can help you find:</p><div className="grid grid-cols-2 gap-1">{GUIDE_CHOICES.map(([label, href]) => <Link key={href} href={href} className="rounded border border-brand-navy/10 bg-white px-2 py-1.5 text-[11px] text-brand-navy hover:bg-brand-gold-pale/30">{label}</Link>)}</div></div>}
      {intro && <div className="m-3 rounded-lg border border-brand-gold/40 bg-brand-gold-pale/20 p-3 text-xs leading-5 text-brand-navy"><div className="mb-2"><CharacterStage character="brixy" motion="listening" className="h-12 w-12 overflow-hidden rounded-full" /></div><p className="font-semibold">Meet Bixy, your SturdiHome guide.</p><p className="mt-1">Bixy helps you navigate services, financing options, vendors, and appointments with a warm, dependable sense of humor.</p><p className="mt-1">Choose Bixy above, type a question, and Bixy will help with the next step.</p><button type="button" onClick={dismissIntro} className="mt-2 font-semibold underline">Got it</button></div>}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">{messages.map((message) => <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}><div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${message.role === "user" ? "bg-brand-navy text-white" : "bg-gray-100 text-gray-900"}`}>{message.parts.map((part, index) => part.type === "text" ? <span key={index} className="whitespace-pre-wrap">{part.text}</span> : null)}</div></div>)}{messages.length === 1 && <div className="flex flex-wrap gap-2 pt-1">{QUICK_LINKS.map((link) => <Link key={link.href} href={link.href} className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50">{link.label}</Link>)}</div>}{busy && <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">Thinking...</div>}{error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">Your guide is temporarily unavailable. Please try again.</div>}</div>
      {!busy && speechText.trim() && <ChatSpeech key={`${latestReply?.id}-${character}-${activeCharacter ?? "idle"}`} text={speechText} character={character} resetToken={speechResetToken} />}
      {authenticated && status && !status.hasAccess ? <PurchaseOptions enabled={paymentsEnabled} /> : !authenticated ? <div className="space-y-2 border-t border-gray-200 p-4 text-sm"><p className="font-semibold text-brand-navy">Join SturdiHome to Continue</p><Link href="/join-network" className="block rounded-md bg-brand-navy px-4 py-3 text-center font-semibold text-white">Join SturdiHome</Link><Link href="/login" className="block text-center text-brand underline">Already a Member? Sign In</Link></div> : <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-200 p-2"><input type="text" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask your guide..." maxLength={2000} className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900" /><button type="submit" disabled={busy || !input.trim()} className="rounded-md bg-brand-navy px-3 py-2 text-sm font-medium text-white disabled:opacity-50">Send</button></form>}
    </div>}
    <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close Bixy AI" : "Ask Bixy AI"} className="flex items-center gap-2 rounded-full bg-brand-navy px-3 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-brand-navy/90 sm:px-4 sm:py-3">
      {open ? "Close" : <><span className="flex -space-x-2" aria-hidden="true"><CharacterStage character="brixy" className="h-8 w-8 overflow-hidden rounded-full border-2 border-brand-gold sm:h-9 sm:w-9" /></span><span>Ask Bixy AI</span></>}
    </button>
  </div>;
}
