"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import TurnstileWidget, { type TurnstileHandle } from "@/components/TurnstileWidget";
import { submitRsvp, type MondayEvent } from "./actions";
import { formatDate } from "@/lib/formatDate";

const CONSENT_TEXT =
  "I agree that Tshiamiso Astronauts NPC may use my details to manage this RSVP and contact me about this event by call, SMS or email. I can ask to see, correct or delete my information at any time.";

// The Grand Final is by invitation only, so its confirmation reminds guests to bring the invitation.
const isInviteOnly = (eventName: string) => /grand final/i.test(eventName);

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

const inputClass =
  "w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-brand-navy text-sm focus:outline-none focus:border-brand-orange focus-visible:ring-2 focus-visible:ring-brand-orange/40";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

const CATEGORY_STYLES: Record<string, string> = {
  "Spelling Bee": "bg-brand-orange text-white",
  Fundraising: "bg-brand-navy text-white",
  Community: "bg-brand-teal text-white",
};

const CATEGORY_ICONS: Record<string, string> = {
  "Spelling Bee": "🐝",
  Fundraising: "💼",
  Community: "🌍",
};

export function EventCard({ event }: { event: MondayEvent }) {
  const [open, setOpen] = useState(false);

  const catStyle = CATEGORY_STYLES[event.category] ?? "bg-gray-200 text-gray-700";
  const catIcon = CATEGORY_ICONS[event.category] ?? "📅";
  const isPast = event.date ? new Date(event.date) < new Date(new Date().toDateString()) : false;

  return (
    <>
      <div
        className={`bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden ${
          isPast ? "opacity-60" : ""
        }`}
      >
        {/* Category bar */}
        <div className={`px-5 py-2 flex items-center gap-2 ${catStyle}`}>
          <span>{catIcon}</span>
          <span className="text-xs font-bold uppercase tracking-wide">{event.category}</span>
        </div>

        <div className="p-6 flex flex-col flex-1">
          {/* Date + time */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-brand-orange font-bold text-sm">{formatDate(event.date)}</span>
            {event.time && event.time !== "TBC" && (
              <span className="text-gray-400 text-sm">· {event.time}</span>
            )}
          </div>

          {/* Name */}
          <h3 className="text-brand-navy font-bold text-lg mb-2 leading-snug">{event.name}</h3>

          {/* Venue */}
          {event.venue && (
            <p className="text-brand-teal text-sm font-semibold mb-3">📍 {event.venue}</p>
          )}

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
            {event.description}
          </p>

          {/* RSVP button */}
          <div className="mt-5">
            {!isPast && event.rsvpOpen ? (
              <button
                onClick={() => setOpen(true)}
                className="w-full bg-brand-orange text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
              >
                RSVP Now
              </button>
            ) : isPast ? (
              <span className="block text-center text-gray-400 text-sm font-semibold py-3">
                Event Passed
              </span>
            ) : (
              <span className="block text-center text-gray-400 text-sm font-semibold py-3">
                RSVP Coming Soon
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RSVP Modal */}
      {open && (
        <RsvpModal event={event} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function RsvpModal({ event, onClose }: { event: MondayEvent; onClose: () => void }) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attendees, setAttendees] = useState("1");
  const [organisation, setOrganisation] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const turnstileToken = useRef("");
  const turnstile = useRef<TurnstileHandle>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Dialog behaviour: focus moves in, Tab stays inside, Esc closes, focus returns to the RSVP button.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("input")?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, []);

  // The form unmounts on success, so move focus to the confirmation to keep keyboard users inside the dialog.
  useEffect(() => {
    if (submitted) dialogRef.current?.focus();
  }, [submitted]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !attendees) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!consent) {
      setError("Please tick the box so we know you agree.");
      return;
    }
    setLoading(true);
    const result = await submitRsvp({
      eventId: event.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      attendees: parseInt(attendees, 10) || 1,
      organisation: organisation.trim(),
      consent,
      turnstileToken: turnstileToken.current,
    });
    turnstile.current?.reset(); // each token works once
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error ?? "Something went wrong. Please try again.");
    }
  }

  const when = [formatDate(event.date), event.time && event.time !== "TBC" ? event.time : ""].filter(Boolean).join(" · ");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id("title")}
        tabIndex={-1}
        className="focus:outline-none bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-brand-teal uppercase tracking-wide mb-0.5">
              RSVP
            </p>
            <h2 id={id("title")} className="text-brand-navy font-bold text-lg leading-snug">{event.name}</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {when}{event.venue ? ` · ${event.venue}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close RSVP form"
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4 min-w-[44px] min-h-[44px]"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-4" role="status">
              <div className="text-5xl mb-3" aria-hidden="true">🚀</div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">You&apos;re registered!</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4" data-clarity-mask="true">
                Thank you, {firstName}! We have received your RSVP for{" "}
                <strong>{event.name}</strong>. We will be in touch at{" "}
                <span className="text-brand-teal font-semibold">{email}</span>.
              </p>
              <dl className="text-left text-sm bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                {event.date && (
                  <div className="flex gap-2">
                    <dt className="font-semibold text-brand-navy w-16 shrink-0">When</dt>
                    <dd className="text-gray-600">{when}</dd>
                  </div>
                )}
                {event.venue && (
                  <div className="flex gap-2">
                    <dt className="font-semibold text-brand-navy w-16 shrink-0">Venue</dt>
                    <dd className="text-gray-600">{event.venue}</dd>
                  </div>
                )}
              </dl>
              {isInviteOnly(event.name) && (
                <p className="text-sm font-semibold text-brand-navy bg-brand-orange/10 rounded-xl px-4 py-3 mb-4">
                  This event is by invitation only. Please bring your invitation with you.
                </p>
              )}
              <button
                type="button"
                onClick={onClose}
                className="bg-brand-navy text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={id("first")} className={labelClass}>First Name *</label>
                  <input
                    id={id("first")} type="text" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={id("last")} className={labelClass}>Last Name *</label>
                  <input
                    id={id("last")} type="text" required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor={id("email")} className={labelClass}>Email Address *</label>
                <input
                  id={id("email")} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={id("phone")} className={labelClass}>Phone Number *</label>
                  <input
                    id={id("phone")} type="tel" required autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+27 82 000 0000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={id("attendees")} className={labelClass}>Attendees *</label>
                  <input
                    id={id("attendees")} type="number" min="1" max="20" required value={attendees} onChange={(e) => setAttendees(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor={id("org")} className={labelClass}>School / Organisation</label>
                <input
                  id={id("org")} type="text" autoComplete="organization" value={organisation} onChange={(e) => setOrganisation(e.target.value)}
                  placeholder="e.g. Evaton Primary School"
                  className={inputClass}
                />
              </div>
              <label htmlFor={id("consent")} className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-gray-600">
                <input
                  id={id("consent")} type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-brand-teal"
                />
                <span>
                  {CONSENT_TEXT}{" "}
                  <Link href="/privacy" target="_blank" rel="noopener" className="font-semibold text-brand-navy underline hover:text-brand-teal">
                    Privacy Policy<span className="sr-only"> (opens in a new tab)</span>
                  </Link>
                </span>
              </label>
              <TurnstileWidget ref={turnstile} onToken={(t) => (turnstileToken.current = t)} />
              {error && <p role="alert" className="text-red-500 text-xs font-semibold">{error}</p>}
              <button
                type="submit" disabled={loading}
                className="w-full bg-brand-orange text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting…" : "Confirm RSVP"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
