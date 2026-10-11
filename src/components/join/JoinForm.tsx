"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useId, useRef, useState } from "react";
import {
  BEST_TIMES,
  CONTACT_METHODS,
  FAMILY_INTERESTS,
  GRADES,
  HEARD_ABOUT,
  JOIN_CONSENT_TEXT,
  JOIN_MESSAGES,
  PROGRAMMES,
  RELATIONSHIPS,
  SUPPORT_EMAIL,
} from "@/config/join";
import { cleanSource } from "@/lib/join/source";
import TurnstileWidget, { type TurnstileHandle } from "@/components/TurnstileWidget";

const inputClass =
  "w-full min-h-[44px] rounded-lg border border-brand-teal bg-white px-4 py-2.5 text-base text-brand-navy placeholder:text-brand-navy/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";
const labelClass = "block text-sm font-semibold text-brand-navy mb-1";
const hintClass = "mb-1 text-sm text-brand-navy";
const errorClass = "mt-1 text-sm font-semibold text-red-800";

type Form = {
  name: string;
  relationship: string;
  phone: string;
  whatsapp: string;
  email: string;
  area: string;
  contactVia: string[];
  bestTime: string;
  learnerName: string;
  learnerSchool: string;
  learnerGrade: string;
  programmes: string[];
  otherLearners: string;
  familyInterest: string[];
  notes: string;
  heardAbout: string;
  consent: boolean;
};
const EMPTY: Form = {
  name: "", relationship: "", phone: "", whatsapp: "", email: "", area: "", contactVia: [], bestTime: "",
  learnerName: "", learnerSchool: "", learnerGrade: "", programmes: [], otherLearners: "", familyInterest: [],
  notes: "", heardAbout: "", consent: false,
};
type Errors = Partial<Record<keyof Form | "form" | "ref", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(?:\+27|0027|27|0)[1-8]\d{8}$/;

function validate(f: Form): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = "Please enter your full name.";
  if (!f.relationship) e.relationship = "Please choose how you are related to the learner.";
  if (!PHONE_RE.test(f.phone.replace(/[\s\-().]/g, ""))) e.phone = "Please enter a South African cell number, for example 082 123 4567.";
  if (!f.whatsapp) e.whatsapp = "Please tell us if this number is on WhatsApp.";
  if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) e.email = "Please enter a valid email address, or leave it blank.";
  if (f.contactVia.length === 0) e.contactVia = "Please choose at least one way for us to contact you.";
  else if (f.contactVia.includes("Email") && !f.email.trim()) e.email = "You chose email, so please enter your email address.";
  if (!f.learnerName.trim()) e.learnerName = "Please enter the learner's first name and surname.";
  if (!f.learnerSchool.trim()) e.learnerSchool = "Please enter the learner's school.";
  if (!f.learnerGrade) e.learnerGrade = "Please choose the learner's grade.";
  if (f.programmes.length === 0) e.programmes = 'Please choose at least one programme, or choose "Not sure yet".';
  if (!f.consent) e.consent = "Please tick the box so we know you agree.";
  return e;
}

function FormInner() {
  const uid = useId();
  const id = (n: string) => `${uid}-${n}`;
  const router = useRouter();
  const params = useSearchParams();
  // Only the cleaned, allow-listed code is ever sent. The raw ?s= text is never kept or shown.
  const source = cleanSource(params.get("s"));

  const mountedAt = useRef(0);
  const tokenRef = useRef("");
  const widget = useRef<TurnstileHandle>(null);
  const [f, setF] = useState<Form>(EMPTY);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((cur) => ({ ...cur, [k]: v }));
  const toggle = (k: "contactVia" | "programmes" | "familyInterest", v: string) =>
    setF((cur) => ({ ...cur, [k]: cur[k].includes(v) ? cur[k].filter((x) => x !== v) : [...cur[k], v] }));

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (busy) return;
      const next = validate(f);
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first) {
        document.getElementById(id(first))?.focus();
        return;
      }

      setBusy(true);
      try {
        // The security check normally finishes in a second or two. Give it a moment before giving up.
        for (let i = 0; i < 24 && !tokenRef.current; i++) await new Promise((r) => setTimeout(r, 250));
        if (!tokenRef.current) {
          setErrors({ form: `The security check has not finished. Please wait a moment and try again, or email ${SUPPORT_EMAIL}.`, ref: "captcha-pending" });
          widget.current?.reset();
          return;
        }
        const res = await fetch("/api/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...f,
            email: f.email.trim(),
            src: source,
            website: honeypot,
            elapsedMs: Math.round(performance.now() - mountedAt.current),
            turnstileToken: tokenRef.current,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; field?: keyof Form; code?: string };
        if (res.ok && data.ok) {
          router.push("/join/thanks");
          return;
        }
        setErrors(data.field ? { [data.field]: data.error } : { form: data.error ?? JOIN_MESSAGES.generic, ref: data.code ?? `http-${res.status}` });
        widget.current?.reset();
        tokenRef.current = "";
      } catch {
        setErrors({ form: JOIN_MESSAGES.generic, ref: "network" });
      } finally {
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [f, honeypot, source, busy],
  );

  const describe = (k: keyof Errors) => (errors[k] ? id(`${k}-err`) : undefined);
  const Err = ({ k }: { k: keyof Errors }) => (errors[k] ? <p id={id(`${k}-err`)} className={errorClass}>{errors[k]}</p> : null);

  const checkGroup = (
    k: "contactVia" | "programmes" | "familyInterest",
    legend: string,
    options: readonly string[],
    hint?: string,
  ) => (
    <fieldset id={id(k)} tabIndex={-1} aria-describedby={describe(k)} className="min-w-0">
      <legend className={labelClass}>{legend}</legend>
      {hint && <p className={hintClass}>{hint}</p>}
      <div>
        {options.map((o) => (
          <label key={o} className="flex min-h-[44px] cursor-pointer items-center gap-3 text-base">
            <input type="checkbox" checked={f[k].includes(o)} onChange={() => toggle(k, o)} className="h-5 w-5 shrink-0 accent-brand-teal" />
            {o}
          </label>
        ))}
      </div>
      <Err k={k} />
    </fieldset>
  );

  const select = (k: "relationship" | "bestTime" | "learnerGrade" | "heardAbout", label: string, options: readonly string[], optional = false) => (
    <div>
      <label htmlFor={id(k)} className={labelClass}>
        {label}
        {optional && <span className="font-normal"> (optional)</span>}
      </label>
      <select id={id(k)} value={f[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} aria-describedby={describe(k)} className={inputClass}>
        <option value="">Choose one</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <Err k={k} />
    </div>
  );

  const text = (
    k: "name" | "phone" | "email" | "area" | "learnerName" | "learnerSchool",
    label: string,
    opts: { optional?: boolean; type?: string; inputMode?: "tel" | "email"; auto?: string; max: number; hint?: string },
  ) => (
    <div>
      <label htmlFor={id(k)} className={labelClass}>
        {label}
        {opts.optional && <span className="font-normal"> (optional)</span>}
      </label>
      {opts.hint && <p className={hintClass}>{opts.hint}</p>}
      <input
        id={id(k)}
        type={opts.type ?? "text"}
        inputMode={opts.inputMode}
        autoComplete={opts.auto ?? "off"}
        maxLength={opts.max}
        value={f[k]}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={!!errors[k]}
        aria-describedby={describe(k)}
        className={inputClass}
      />
      <Err k={k} />
    </div>
  );

  const area = (k: "otherLearners" | "notes", label: string, hint?: string) => (
    <div>
      <label htmlFor={id(k)} className={labelClass}>
        {label} <span className="font-normal">(optional)</span>
      </label>
      {hint && <p className={hintClass}>{hint}</p>}
      <textarea
        id={id(k)}
        rows={3}
        maxLength={1000}
        value={f[k]}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={!!errors[k]}
        aria-describedby={describe(k)}
        className={inputClass}
      />
      <Err k={k} />
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="text-brand-navy">
      {/* Honeypot: real people never see or reach this field. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <div className="space-y-8">
        <section className="space-y-4" aria-labelledby={id("h-you")}>
          <h3 id={id("h-you")} className="text-lg font-bold">About you</h3>
          {text("name", "Your full name (parent or guardian)", { auto: "name", max: 100 })}
          {select("relationship", "Your relationship to the learner(s)", RELATIONSHIPS)}
          {text("phone", "Your cell number", { type: "tel", inputMode: "tel", auto: "tel", max: 20, hint: "We will call this number within 7 days." })}
          <fieldset id={id("whatsapp")} tabIndex={-1} aria-describedby={describe("whatsapp")} className="min-w-0">
            <legend className={labelClass}>Is this number on WhatsApp?</legend>
            <div className="flex gap-6">
              {["Yes", "No"].map((o) => (
                <label key={o} className="flex min-h-[44px] cursor-pointer items-center gap-3 text-base">
                  <input type="radio" name={id("whatsapp")} checked={f.whatsapp === o} onChange={() => set("whatsapp", o)} className="h-5 w-5 shrink-0 accent-brand-teal" />
                  {o}
                </label>
              ))}
            </div>
            <Err k="whatsapp" />
          </fieldset>
          {text("email", "Your email address", { optional: true, type: "email", inputMode: "email", auto: "email", max: 254 })}
          {text("area", "Your area or suburb", { optional: true, auto: "address-level2", max: 100 })}
          {checkGroup("contactVia", "How would you like us to contact you?", CONTACT_METHODS)}
          {select("bestTime", "Best time to call", BEST_TIMES, true)}
        </section>

        <section className="space-y-4" aria-labelledby={id("h-learner")}>
          <h3 id={id("h-learner")} className="text-lg font-bold">About the learner</h3>
          {text("learnerName", "Learner 1: first name and surname", { max: 100 })}
          {text("learnerSchool", "Learner 1: school", { max: 120 })}
          {select("learnerGrade", "Learner 1: grade", GRADES)}
          {checkGroup("programmes", "Learner 1: programmes of interest", PROGRAMMES, "Tick all that apply. Not sure? Choose the last option and we will help you decide.")}
          {area("otherLearners", "Other learners", "More than one child? Write one learner per line: first name and surname, school, grade, and the programme you are interested in.")}
        </section>

        <section className="space-y-4" aria-labelledby={id("h-more")}>
          <h3 id={id("h-more")} className="text-lg font-bold">A little more</h3>
          {checkGroup("familyInterest", "Is anyone in your family interested in these too?", FAMILY_INTERESTS, "Optional. Tick any that apply.")}
          {area("notes", "Anything else we should know?", "For example: home language, or days that work best.")}
          {select("heardAbout", "How did you hear about TA?", HEARD_ABOUT, true)}
        </section>

        <section aria-labelledby={id("h-privacy")} className="rounded-xl bg-white p-4">
          <h3 id={id("h-privacy")} className="text-lg font-bold">Privacy and photos</h3>
          <p className="mt-1 text-sm leading-relaxed">
            We only use your details to contact you about TA programmes. We do not sell or share them. This form does not
            give permission for photographs; we have a separate photography consent form. Read our{" "}
            <Link href="/privacy" target="_blank" rel="noopener" className="font-semibold underline">
              Privacy Policy<span className="sr-only"> (opens in a new tab)</span>
            </Link>
            . Information Officer:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline">{SUPPORT_EMAIL}</a>.
          </p>
          <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
            <input
              id={id("consent")}
              type="checkbox"
              checked={f.consent}
              onChange={(e) => set("consent", e.target.checked)}
              aria-invalid={!!errors.consent}
              aria-describedby={describe("consent")}
              className="mt-0.5 h-5 w-5 shrink-0 accent-brand-teal"
            />
            <span>{JOIN_CONSENT_TEXT}</span>
          </label>
          <Err k="consent" />
        </section>
      </div>

      <TurnstileWidget ref={widget} onToken={(t) => (tokenRef.current = t)} />

      {errors.form && (
        <p role="alert" className="mt-4 rounded-lg border border-red-800 bg-white p-3 text-sm font-semibold text-red-800">
          {errors.form}
          {errors.ref && <span className="mt-1 block font-normal">Ref: {errors.ref}</span>}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-brand-orange px-8 py-3 text-lg font-bold text-brand-navy hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Sending..." : "Send my details"}
      </button>
    </form>
  );
}

export default function JoinForm() {
  return (
    <Suspense fallback={<p className="text-brand-navy" role="status">Loading the form...</p>}>
      <FormInner />
    </Suspense>
  );
}
