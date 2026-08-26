"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

const GREETING =
  "Hi! I'm the SturdiHome Assistant. I can help you find home services, learn about financing options, become a vendor, or find the right SturdiHome page.";

const QUICK_LINKS = [
  { href: "/signup", label: "Join as a homeowner" },
  { href: "/apply/vendor", label: "Apply as a vendor" },
  { href: "/apply/financing", label: "Apply as a financing partner" },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat<UIMessage>({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    messages: [
      {
        id: "greeting",
        role: "assistant",
        parts: [{ type: "text", text: GREETING }],
      },
    ],
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const busy = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="flex h-[70vh] max-h-[32rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-brand-navy px-4 py-3">
            <p className="text-sm font-semibold text-white">SturdiHome Assistant</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-white/80 hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-brand-navy text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.parts.map((part, i) =>
                    part.type === "text" ? <span key={i} className="whitespace-pre-wrap">{part.text}</span> : null,
                  )}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {busy && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500">Thinking…</div>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                Sorry, something went wrong. Please try again, or use the sign-up/apply forms
                above and our team will follow up with you directly.
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-gray-200 p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              maxLength={2000}
              className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-md bg-brand-navy px-3 py-2 text-sm font-medium text-white hover:bg-brand-navy/90 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Ask SturdiHome"}
        className="flex items-center gap-2 rounded-full bg-brand-navy px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-brand-navy/90"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        {open ? "Close" : "Ask SturdiHome"}
      </button>
    </div>
  );
}
