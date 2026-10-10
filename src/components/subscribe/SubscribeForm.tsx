"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AUDIENCES,
  CONSENT_TEXT,
  LANGUAGES,
  MESSAGES,
  TOPICS,
  TOPIC_KEYS,
  type Placement,
  type SubscribeVariant,
  type TopicKey,
} from "@/config/subscribe";
import { markSubscribed } from "@/lib/subscribe/clientFlags";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let turnstileLoader: Promise<void> | null = null;
function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  turnstileLoader ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = TURNSTILE_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      turnstileLoader = null;
      reject(new Error("turnstile"));
    };
    document.head.appendChild(s);
  });
  return turnstileLoader;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const inputClass =
  "w-full min-h-[44px] rounded-lg border border-brand-teal bg-white px-4 py-2.5 text-base text-brand-navy placeholder:text-brand-navy/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";
const labelClass = "block text-sm font-semibold text-brand-navy mb-1";
const errorClass = "mt-1 text-sm font-semibold text-red-800";

type Errors = Partial<Record<"firstName" | "email" | "consent" | "topics" | "form" | "ref", string>>;

export interface SubscribeFormProps {
  variant: SubscribeVariant;
  placement: Placement;
  /** Called once the "Almost there" message is showing (the pop-up uses it to stay open on the message). */
  onSubmitted?: () => void;
  /** Stack fields in one column even on wide screens (pop-up, narrow cards). */
  stacked?: boolean;
}

export default function SubscribeForm({ variant, placement, onSubmitted, stacked = false }: SubscribeFormProps) {
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const mountedAt = useRef<number>(0);
  const widgetEl = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const tokenRef = useRef<string>("");
  const widgetError = useRef<string>("");
  const doneRef = useRef<HTMLDivElement>(null);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [audience, setAudience] = useState("");
  const [language, setLanguage] = useState("");
  const [topics, setTopics] = useState<TopicKey[]>([]);
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Turnstile loads when the form mounts and stays invisible unless Cloudflare needs a click.
  useEffect(() => {
    if (!siteKey || !widgetEl.current) return;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !widgetEl.current || !window.turnstile || widgetId.current) return;
        widgetId.current = window.turnstile.render(widgetEl.current, {
          sitekey: siteKey,
          appearance: "interaction-only",
          callback: (t: string) => {
            tokenRef.current = t;
            widgetError.current = "";
          },
          "expired-callback": () => (tokenRef.current = ""),
          "error-callback": (code?: unknown) => {
            tokenRef.current = "";
            widgetError.current = String(code ?? "error");
            return true;
          },
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  useEffect(() => {
    if (submitted) doneRef.current?.focus();
  }, [submitted]);

  const toggleTopic = (k: TopicKey) =>
    setTopics((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const next: Errors = {};
      if (!firstName.trim()) next.firstName = MESSAGES.invalidName;
      if (!EMAIL_RE.test(email.trim())) next.email = MESSAGES.invalidEmail;
      if (variant === "full" && topics.length === 0) next.topics = MESSAGES.noTopic;
      if (!consent) next.consent = MESSAGES.noConsent;
      setErrors(next);
      if (Object.keys(next).length) {
        const first = Object.keys(next)[0];
        document.getElementById(id(first === "firstName" ? "name" : first))?.focus();
        return;
      }

      setBusy(true);
      try {
        // The security check normally finishes in a second or two. Give it a moment before giving up.
        for (let i = 0; i < 20 && !tokenRef.current && !widgetError.current; i++) {
          await new Promise((r) => setTimeout(r, 250));
        }
        if (!tokenRef.current) {
          setErrors({
            form: "The security check has not finished. Please wait a moment and try again, or email info@tshiamisoastronauts.org.",
            ref: widgetError.current ? `captcha-widget-${widgetError.current}` : "captcha-pending",
          });
          if (window.turnstile && widgetId.current) window.turnstile.reset(widgetId.current);
          return;
        }
        const src = new URLSearchParams(window.location.search).get("src") ?? undefined;
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variant,
            firstName: firstName.trim(),
            email: email.trim(),
            audience: audience || undefined,
            topics: variant === "full" ? topics : undefined,
            language: language || undefined,
            consent,
            placement,
            src,
            page: window.location.pathname,
            website: honeypot,
            elapsedMs: Math.round(performance.now() - mountedAt.current),
            turnstileToken: tokenRef.current,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; field?: keyof Errors; code?: string };
        if (res.ok && data.ok) {
          markSubscribed();
          setSubmitted(true);
          onSubmitted?.();
        } else {
          setErrors(
            data.field
              ? { [data.field]: data.error }
              : { form: data.error ?? MESSAGES.generic, ref: data.code ?? `http-${res.status}` },
          );
          if (window.turnstile && widgetId.current) window.turnstile.reset(widgetId.current);
          tokenRef.current = "";
        }
      } catch {
        setErrors({ form: MESSAGES.generic });
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [firstName, email, audience, language, topics, consent, honeypot, variant, placement, onSubmitted],
  );

  if (submitted) {
    return (
      <div
        ref={doneRef}
        tabIndex={-1}
        role="status"
        className="rounded-xl border border-brand-teal bg-white p-5 text-brand-navy focus:outline-none"
      >
        <p className="text-lg font-bold">Almost there.</p>
        <p className="mt-1 text-sm leading-relaxed">
          We have sent an email to the address you gave. Tap <strong>Confirm</strong> in that email to finish. It can
          take a few minutes. Check your spam folder if you do not see it.
        </p>
      </div>
    );
  }

  const describe = (key: keyof Errors, ...extra: string[]) =>
    [errors[key] ? id(`${key}-err`) : "", ...extra].filter(Boolean).join(" ") || undefined;
  const cols = variant === "full" || stacked ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";

  return (
    <form onSubmit={submit} noValidate className="text-brand-navy">
      {/* Honeypot: real people never see or reach this field. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <div className={`grid gap-4 ${cols}`}>
        <div>
          <label htmlFor={id("name")} className={labelClass}>First name</label>
          <input
            id={id("name")}
            type="text"
            autoComplete="given-name"
            required
            maxLength={60}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            aria-invalid={!!errors.firstName}
            aria-describedby={describe("firstName")}
            className={inputClass}
          />
          {errors.firstName && <p id={id("firstName-err")} className={errorClass}>{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor={id("email")} className={labelClass}>Email address</label>
          <input
            id={id("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={describe("email")}
            className={inputClass}
          />
          {errors.email && <p id={id("email-err")} className={errorClass}>{errors.email}</p>}
        </div>

        {variant === "full" && (
          <>
            <div>
              <label htmlFor={id("audience")} className={labelClass}>I am a... <span className="font-normal">(optional)</span></label>
              <select id={id("audience")} value={audience} onChange={(e) => setAudience(e.target.value)} className={inputClass}>
                <option value="">Choose one</option>
                {Object.entries(AUDIENCES).map(([k, a]) => (
                  <option key={k} value={k}>{a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={id("language")} className={labelClass}>Home language <span className="font-normal">(optional)</span></label>
              <select id={id("language")} value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
                <option value="">Choose one</option>
                {Object.entries(LANGUAGES).map(([k, l]) => (
                  <option key={k} value={k}>{l.label}</option>
                ))}
              </select>
            </div>
            <fieldset id={id("topics")} tabIndex={-1} aria-describedby={describe("topics")} className="min-w-0">
              <legend className={labelClass}>Which emails would you like?</legend>
              <div className="space-y-1">
                {TOPIC_KEYS.map((k) => (
                  <label key={k} className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={topics.includes(k)}
                      onChange={() => toggleTopic(k)}
                      className="h-5 w-5 shrink-0 accent-brand-teal"
                    />
                    {TOPICS[k].label}
                  </label>
                ))}
              </div>
              {errors.topics && <p id={id("topics-err")} className={errorClass}>{errors.topics}</p>}
            </fieldset>
          </>
        )}
      </div>

      <div className="mt-3">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
          <input
            id={id("consent")}
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={!!errors.consent}
            aria-describedby={describe("consent")}
            className="mt-0.5 h-5 w-5 shrink-0 accent-brand-teal"
          />
          <span>
            {CONSENT_TEXT[variant]}{" "}
            <Link href="/privacy#newsletter-and-emails" target="_blank" rel="noopener" className="font-semibold text-brand-navy underline hover:text-brand-teal">
              Privacy Policy<span className="sr-only"> (opens in a new tab)</span>
            </Link>
          </span>
        </label>
        {errors.consent && <p id={id("consent-err")} className={errorClass}>{errors.consent}</p>}
      </div>

      <div ref={widgetEl} className="mt-2 empty:hidden" />

      {errors.form && (
        <div role="alert" className="mt-3">
          <p className={errorClass}>{errors.form}</p>
          {errors.ref && <p className="mt-1 text-xs">Ref: {errors.ref}</p>}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={busy}
          className="min-h-[44px] rounded-lg bg-brand-orange px-6 py-2.5 text-base font-bold text-brand-navy transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy disabled:opacity-60"
        >
          {busy ? "Sending..." : "Subscribe"}
        </button>
        <p className="text-xs">No spam. Unsubscribe at any time.</p>
      </div>
    </form>
  );
}
