"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Rocket } from "lucide-react";
import { submitContactForm } from "./actions";

const SUBJECTS = [
  "General Enquiry",
  "Donation",
  "Volunteer",
  "Partnership / Sponsorship",
  "Media & Press",
  "Other",
];

const CONTACT_DETAILS = [
  {
    Icon: Mail,
    label: "Email Us",
    value: "info@tshiamisoastronauts.org",
    href: "mailto:info@tshiamisoastronauts.org",
  },
  {
    Icon: Phone,
    label: "Call Us",
    value: "+27 66 071 5426",
    href: "tel:+27660715426",
  },
  {
    Icon: MapPin,
    label: "Find Us",
    value: "4206 Kopanong Street, Ext 3\nEvaton West, Mafatsana, 1984",
    href: "https://maps.google.com/?q=4206+Kopanong+Street+Evaton+West",
  },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://shorturl.at/qxNZd",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://shorturl.at/DanLM",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://shorturl.at/I2QQk",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !subject || !message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const result = await submitContactForm({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject,
      message: message.trim(),
    });
    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-br from-brand-navy to-brand-teal py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-brand-light-teal text-sm font-semibold uppercase tracking-widest mb-4">
            Get In Touch
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Contact{" "}
            <span className="text-brand-orange">Us</span>
          </h1>
          <p className="text-gray-200 text-lg leading-relaxed">
            Have a question, partnership idea, or just want to say hello? We would
            love to hear from you.
          </p>
        </div>
      </section>

      {/* CONTACT DETAILS + FORM */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Left — Contact info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-brand-navy mb-6">
                How to reach us
              </h2>
              <div className="space-y-5">
                {CONTACT_DETAILS.map(({ Icon, label, value, href }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="text-brand-orange" size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brand-teal uppercase tracking-wide mb-0.5">
                        {label}
                      </p>
                      <p className="text-brand-navy font-semibold text-sm leading-relaxed group-hover:text-brand-orange transition-colors whitespace-pre-line">
                        {value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Social */}
            <div>
              <p className="text-xs font-semibold text-brand-teal uppercase tracking-wide mb-3">
                Follow Us
              </p>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-xl bg-brand-navy text-white flex items-center justify-center hover:bg-brand-teal transition-colors"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Office hours */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-brand-teal uppercase tracking-wide mb-3">
                Office Hours
              </p>
              <div className="space-y-1 text-sm text-brand-navy">
                <div className="flex justify-between">
                  <span>Monday – Friday</span>
                  <span className="font-semibold">08:00 – 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-semibold">09:00 – 13:00</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-navy flex items-center justify-center mx-auto mb-4">
                  <Rocket className="text-brand-orange" size={32} strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-brand-navy mb-2">
                  Message Received!
                </h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Thank you, {firstName}! We have received your message and will get
                  back to you at{" "}
                  <span className="text-brand-teal font-semibold">{email}</span> as
                  soon as possible.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/"
                    className="bg-brand-navy text-white font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Back to Home
                  </Link>
                  <Link
                    href="/programmes"
                    className="border-2 border-brand-teal text-brand-teal font-bold px-8 py-3 rounded-lg hover:bg-brand-teal hover:text-white transition-colors"
                  >
                    Our Programmes
                  </Link>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-5"
              >
                <h2 className="text-2xl font-bold text-brand-navy">
                  Send us a message
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+27 82 000 0000"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-brand-navy focus:outline-none focus:border-brand-teal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Subject *
                  </label>
                  <select
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-brand-navy focus:outline-none focus:border-brand-teal bg-white"
                  >
                    <option value="">Select a subject…</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help…"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-brand-navy focus:outline-none focus:border-brand-teal resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm font-semibold">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-teal text-white font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending…" : "Send Message"}
                </button>

                <p className="text-gray-400 text-xs text-center">
                  We typically respond within 1–2 working days.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* DONATE + VOLUNTEER STRIP */}
      <section className="py-16 px-6 bg-brand-navy">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
          <div className="bg-white/10 rounded-2xl p-8">
            <h3 className="text-white font-bold text-xl mb-2">Support Our Work</h3>
            <p className="text-gray-300 text-sm mb-6">
              Your donation funds books, tutors, and digital access for learners in
              Evaton West.
            </p>
            <Link
              href="/donate"
              className="inline-block bg-brand-orange text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Donate Now
            </Link>
          </div>
          <div className="bg-white/10 rounded-2xl p-8">
            <h3 className="text-white font-bold text-xl mb-2">Join the Team</h3>
            <p className="text-gray-300 text-sm mb-6">
              Give your time and skills to help children discover the power of
              reading.
            </p>
            <Link
              href="/volunteer"
              className="inline-block bg-brand-teal text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Volunteer
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
