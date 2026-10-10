"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { COOKIE_ACK_EVENT } from "@/config/consent";
import {
  cookieNoticeAnswered,
  isSnoozed,
  isSubscribed,
  markShownThisSession,
  shownThisSession,
  snooze,
} from "@/lib/subscribe/clientFlags";
import SubscribeForm from "./SubscribeForm";

const SCROLL_TARGET = 0.6;
const DWELL_MS = 30_000;

// Another overlay (cookie notice, RSVP form) is up: wait, never stack.
function otherOverlayVisible(self: HTMLElement | null): boolean {
  return Array.from(document.querySelectorAll('[role="dialog"], dialog[open]')).some((el) => el !== self);
}

/**
 * Polite blog pop-up. Mounted on blog posts only. Rules live in the TA brief, section 4:
 * 60% scroll and 30 seconds (desktop: or exit intent after 30 seconds), once a session, 30-day
 * snooze, never again after a sign-up, never over the cookie notice, kill switch via /api/subscribe/popup.
 */
export default function SubscribePopup() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [step, setStep] = useState<"pitch" | "form">("form");
  const [submitted, setSubmitted] = useState(false);

  const isPost = /^\/blog\/[^/]+/.test(pathname ?? "");

  useEffect(() => {
    if (!isPost) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("src") === "newsletter") return;
    if (isSubscribed() || isSnoozed() || shownThisSession()) return;

    let cancelled = false;
    let opened = false;
    let dwellDone = false;
    let scrolled = false;
    let exitIntent = false;
    let timer: number | undefined;
    let retry: number | undefined;
    const cleanups: Array<() => void> = [];

    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const check = () => {
      if (cancelled || opened || !dwellDone) return;
      if (document.visibilityState !== "visible") return;
      if (!(scrolled || (desktop && exitIntent))) return;
      if (!cookieNoticeAnswered()) return; // wait for the cookie notice to be answered
      if (otherOverlayVisible(null)) {
        window.clearTimeout(retry);
        retry = window.setTimeout(check, 2000);
        return;
      }
      opened = true;
      markShownThisSession();
      returnFocus.current = document.activeElement as HTMLElement | null;
      const small = window.matchMedia("(max-width: 639px)").matches;
      setCompact(small);
      setStep(small ? "pitch" : "form");
      setOpen(true);
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0 || window.scrollY / max >= SCROLL_TARGET) {
        scrolled = true;
        check();
      }
    };
    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) {
        exitIntent = true;
        check();
      }
    };
    // Give the cookie notice a moment to leave the page before looking for other overlays.
    const onCookieAck = () => {
      window.clearTimeout(retry);
      retry = window.setTimeout(check, 400);
    };

    // Ask the server whether the kill switch is off before arming anything.
    fetch("/api/subscribe/popup", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { enabled: false }))
      .then((cfg: { enabled?: boolean }) => {
        if (cancelled || !cfg.enabled) return;
        timer = window.setTimeout(() => {
          dwellDone = true;
          onScroll();
          check();
        }, DWELL_MS);
        window.addEventListener("scroll", onScroll, { passive: true });
        document.addEventListener("mouseout", onMouseOut);
        window.addEventListener(COOKIE_ACK_EVENT, onCookieAck);
        cleanups.push(
          () => window.removeEventListener("scroll", onScroll),
          () => document.removeEventListener("mouseout", onMouseOut),
          () => window.removeEventListener(COOKIE_ACK_EVENT, onCookieAck),
        );
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(retry);
      cleanups.forEach((fn) => fn());
    };
  }, [isPost]);

  useEffect(() => {
    const d = dialogRef.current;
    if (open && d && !d.open) d.showModal();
  }, [open]);

  const close = useCallback((remember: boolean) => {
    if (remember) snooze();
    dialogRef.current?.close();
    setOpen(false);
    returnFocus.current?.focus?.();
  }, []);

  if (!isPost || !open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby="ta-pop-title"
      aria-describedby="ta-pop-desc"
      onCancel={(e) => {
        e.preventDefault();
        close(!submitted);
      }}
      className="ta-pop fixed inset-x-0 bottom-0 top-auto m-0 max-h-[90vh] w-full max-w-none overflow-y-auto rounded-t-2xl border-t-4 border-brand-teal bg-brand-card p-5 text-brand-navy shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:max-w-[calc(100vw-3rem)] sm:rounded-2xl sm:border-t-0 sm:border-l-4"
    >
      <button
        type="button"
        onClick={() => close(!submitted)}
        aria-label="Close"
        className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none text-brand-navy hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-navy"
      >
        <span aria-hidden="true">&times;</span>
      </button>

      <h2 id="ta-pop-title" className="pr-10 text-lg font-bold leading-snug">
        Stories from Evaton West, once a month
      </h2>
      <p id="ta-pop-desc" className="mt-1 text-sm leading-relaxed">
        Learner wins, event invitations and ways to help. One short email, no spam.
      </p>

      {compact && step === "pitch" ? (
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setStep("form")}
            className="min-h-[44px] rounded-lg bg-brand-orange px-6 py-2.5 text-base font-bold text-brand-navy hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
          >
            Subscribe
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className="min-h-[44px] px-2 text-sm font-semibold text-brand-navy underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-navy"
          >
            No thanks
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <SubscribeForm variant="short" placement="blog-popup" stacked onSubmitted={() => setSubmitted(true)} />
          {!submitted && (
            <button
              type="button"
              onClick={() => close(true)}
              className="mt-2 min-h-[44px] px-1 text-sm font-semibold text-brand-navy underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-navy"
            >
              No thanks
            </button>
          )}
        </div>
      )}
    </dialog>
  );
}
