"use client";

import { useEffect } from "react";
import { COOKIE_ACK_EVENT } from "@/config/consent";
import { readConsent } from "@/lib/consent";

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

let loaded = false;

// Microsoft Clarity records clicks, scrolling and sessions and sets cookies, so it stays completely off,
// with no request to Microsoft, until the visitor has chosen Accept in the cookie banner. This holds for
// every visitor, not only the EEA and UK, so it needs no location check.
function load(projectId: string) {
  if (loaded) return;
  loaded = true;
  const w = window;
  w.clarity =
    w.clarity ||
    function (...args: unknown[]) {
      (w.clarity!.q = w.clarity!.q || []).push(args);
    };
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.clarity.ms/tag/${projectId}`;
  const first = document.getElementsByTagName("script")[0];
  first?.parentNode?.insertBefore(s, first);
}

// Withdrawing consent: tell Clarity to stop and erase its cookies where we can.
function stop() {
  try {
    window.clarity?.("consent", false);
  } catch {
    /* ignore */
  }
  const host = window.location.hostname;
  const parts = host.split(".");
  const parent = parts.length > 2 ? parts.slice(-2).join(".") : host;
  for (const name of ["_clck", "_clsk", "CLID", "ANONCHK", "MR", "MUID", "SM"]) {
    for (const domain of [host, `.${host}`, `.${parent}`]) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; Max-Age=0; path=/`;
  }
}

export default function ClarityLoader({ enabled, projectId }: { enabled: boolean; projectId: string }) {
  useEffect(() => {
    if (!enabled) return;
    const sync = () => {
      if (readConsent()?.ads === true) load(projectId);
      else if (loaded) stop();
    };
    sync();
    window.addEventListener(COOKIE_ACK_EVENT, sync);
    return () => window.removeEventListener(COOKIE_ACK_EVENT, sync);
  }, [enabled, projectId]);

  return null;
}
