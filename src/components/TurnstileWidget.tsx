"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loader: Promise<void> | null = null;
function load(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loader = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(s);
  });
  return loader;
}

export interface TurnstileHandle {
  reset: () => void;
}

/** Cloudflare Turnstile check. Invisible unless Cloudflare needs a click. */
const TurnstileWidget = forwardRef<
  TurnstileHandle,
  {
    onToken: (token: string) => void;
    /** Optional. Called with a short reason when the check cannot run: "no-sitekey", "script-blocked", or Cloudflare's error code. */
    onProblem?: (reason: string) => void;
  }
>(function TurnstileWidget({ onToken, onProblem }, ref) {
  const el = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const cb = useRef(onToken);
  cb.current = onToken;
  const problem = useRef(onProblem);
  problem.current = onProblem;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useImperativeHandle(ref, () => ({
    reset: () => {
      cb.current("");
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    if (!siteKey) {
      problem.current?.("no-sitekey");
      return;
    }
    if (!el.current) return;
    let cancelled = false;
    load()
      .then(() => {
        if (cancelled || !el.current || !window.turnstile || widgetId.current) return;
        widgetId.current = window.turnstile.render(el.current, {
          sitekey: siteKey,
          appearance: "interaction-only",
          callback: (t: string) => cb.current(t),
          "expired-callback": () => cb.current(""),
          "error-callback": (code?: unknown) => {
            cb.current("");
            problem.current?.(String(code ?? "error"));
            return true;
          },
        });
      })
      .catch(() => problem.current?.("script-blocked"));
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  return <div ref={el} />;
});

export default TurnstileWidget;
