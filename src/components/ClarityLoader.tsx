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

// Microsoft Clarity records clicks, scrolling and sessions and sets cookies. It follows the same rule as
// the Google cookies: in the EEA and UK it stays completely off (no request to Microsoft) until the visitor
// chooses Accept; everywhere else it is on unless the visitor chooses Decline. The visitor's country comes
// from /api/region (Cloudflare's country header). If the country cannot be told, the opt-in rule applies.
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

async function needsOptIn(): Promise<boolean> {
  try {
    const res = await fetch("/api/region", { cache: "no-store" });
    if (!res.ok) return true;
    const data = (await res.json()) as { optIn?: boolean };
    return data.optIn !== false;
  } catch {
    return true;
  }
}

export default function ClarityLoader({ enabled, projectId }: { enabled: boolean; projectId: string }) {
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const sync = async () => {
      const choice = readConsent();
      if (choice?.ads === true) return load(projectId);
      if (choice?.ads === false) return loaded ? stop() : undefined;
      // No choice yet: on by default only outside the EEA and UK.
      if (await needsOptIn()) return;
      if (!cancelled && readConsent() === null) load(projectId);
    };
    void sync();
    const onAck = () => void sync();
    window.addEventListener(COOKIE_ACK_EVENT, onAck);
    return () => {
      cancelled = true;
      window.removeEventListener(COOKIE_ACK_EVENT, onAck);
    };
  }, [enabled, projectId]);

  return null;
}
