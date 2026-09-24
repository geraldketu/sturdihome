"use client";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { acknowledgeWelcome, finishWelcome } from "@/lib/actions/welcome-actions";
import { SubmitButton } from "@/components/ui";

const seenWelcomes = new Set<string>();

export default function LoginWelcome({ title, message, welcomeKey, role }: { title: string; message: string; welcomeKey: string; role: string }) {
  const form = useRef<HTMLFormElement>(null);
  const panel = useRef<HTMLElement>(null);
  const mounted = useRef(false);
  useLayoutEffect(() => {
    // Suppress cached Back/Forward renders too, without replaying the animation.
    if (!mounted.current && seenWelcomes.has(welcomeKey)) {
      panel.current?.setAttribute("hidden", "");
      form.current?.requestSubmit();
      return;
    }
    mounted.current = true;
    seenWelcomes.add(welcomeKey);
    void acknowledgeWelcome().catch(() => { /* The continue action retries acknowledgment. */ });
    const timer = setTimeout(() => form.current?.requestSubmit(), 4500);
    return () => clearTimeout(timer);
  }, [welcomeKey]);
  return <main className="mx-auto w-full max-w-xl px-4 py-12 sm:py-20">
    <section ref={panel} aria-labelledby="login-welcome-title" className="login-welcome relative overflow-hidden rounded-2xl border border-brand-gold/40 bg-white px-5 py-10 text-center shadow-lg sm:px-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {[0, 1, 2, 3, 4].map(i => <span key={i} data-welcome-symbol={role === "VENDOR" ? "tool" : role === "FINANCING_PARTNER" ? "finance" : "heart"} className={`welcome-heart absolute ${role === "HOMEOWNER" ? "welcome-member-heart text-[#FF0000]" : "text-brand-gold"}`} style={{ left: `${8 + i * 20}%`, animationDelay: `${i * .45}s` }}>
          {role === "VENDOR" ? <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a5.5 5.5 0 0 0-6.9 6.9l-5.1 5.1a2.1 2.1 0 0 0 3 3l5.1-5.1a5.5 5.5 0 0 0 6.9-6.9l-3 3-3-3 3-3Z" /></svg> : role === "FINANCING_PARTNER" ? <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 5v14m4-11h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" /></svg> : "♥"}
        </span>)}
      </div>
      <Image src="/images/sturdihome-logo.png" alt="SturdiHome Network" width={280} height={320} className="relative mx-auto mb-6 h-24 w-auto object-contain" priority />
      <h1 id="login-welcome-title" className="relative text-2xl font-semibold text-brand-navy sm:text-3xl">{title}</h1>
      <p className="relative mt-4 leading-7 text-gray-600">{message}</p>
      <p className="relative mt-6 text-sm text-gray-500">Taking you to your SturdiHome experience in a moment.</p>
      <form ref={form} action={finishWelcome} className="relative mt-5"><SubmitButton pendingText="Continuing…">Continue now</SubmitButton></form>
    </section>
  </main>;
}
