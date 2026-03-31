"use client";

import { useState } from "react";
import { submitRsvp, type MondayEvent } from "./actions";
import { formatDate } from "@/lib/formatDate";

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attendees, setAttendees] = useState("1");
  const [organisation, setOrganisation] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !attendees) {
      setError("Please fill in all required fields.");
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
    });
    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold text-brand-teal uppercase tracking-wide mb-0.5">
              RSVP
            </p>
            <h2 className="text-brand-navy font-bold text-lg leading-snug">{event.name}</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {formatDate(event.date)}{event.time && event.time !== "TBC" ? ` · ${event.time}` : ""} · {event.venue}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">🚀</div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">You&apos;re registered!</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Thank you, {firstName}! We have received your RSVP for{" "}
                <strong>{event.name}</strong>. We will be in touch at{" "}
                <span className="text-brand-teal font-semibold">{email}</span>.
              </p>
              <button
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
                  <label className="block text-xs font-semibold text-gray-600 mb-1">First Name *</label>
                  <input
                    type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-brand-navy text-sm focus:outline-none focus:border-brand-orange"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Last Name *</label>
                  <input
                    type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-brand-navy text-sm focus:outline-none focus:border-brand-orange"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address *</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-brand-navy text-sm focus:outline-none focus:border-brand-orange"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                  <input
                    type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+27 82 000 0000"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-brand-navy text-sm focus:outline-none focus:border-brand-orange"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Attendees *</label>
                  <input
                    type="number" min="1" max="20" required value={attendees} onChange={(e) => setAttendees(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-brand-navy text-sm focus:outline-none focus:border-brand-orange"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">School / Organisation</label>
                <input
                  type="text" value={organisation} onChange={(e) => setOrganisation(e.target.value)}
                  placeholder="e.g. Evaton Primary School"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-brand-navy text-sm focus:outline-none focus:border-brand-orange"
                />
              </div>
              {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
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
