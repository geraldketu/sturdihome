"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { safeReturnTo } from "@/lib/access";

// Client-side shortcut only; proxy.ts and server checks remain the enforcement layer.
export default function AuthGate({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (signedIn) return;
    const gate = (event: Event, target: URL) => {
      if (target.origin !== location.origin) return;
      const next = safeReturnTo(target.pathname + target.search + target.hash);
      if (!next) return;
      event.preventDefault();
      event.stopPropagation();
      router.push(`/login?next=${encodeURIComponent(next)}`);
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      gate(event, new URL(link.href));
    };
    const onSubmit = (event: SubmitEvent) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || event.defaultPrevented) return;
      const submitter = event.submitter as HTMLButtonElement | HTMLInputElement | null;
      const method = (submitter?.getAttribute("formmethod") ?? form.getAttribute("method") ?? "get").toLowerCase();
      if (method !== "get") return;
      const target = new URL(submitter?.getAttribute("formaction") ?? form.getAttribute("action") ?? location.href, location.href);
      target.search = new URLSearchParams(new FormData(form, submitter) as unknown as Record<string, string>).toString();
      gate(event, target);
    };
    window.addEventListener("click", onClick, true);
    window.addEventListener("submit", onSubmit, true);
    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("submit", onSubmit, true);
    };
  }, [signedIn, router]);
  return null;
}
