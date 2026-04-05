"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Handshake, Sprout, Trophy, Rocket } from "lucide-react";
import { submitVolunteerApplication } from "./actions";

const ROLES = [
  "Comprehension Navigator (Grades 4–7)",
  "Phonics Specialist (Grade 1)",
  "Fluency Coach (Grades 2–3)",
  "Homework Support (Intermediate/High School)",
  "Data Marshall (Monitoring & Evaluation)",
];

const AVAILABILITY = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings",
  "Weekends",
  "School holidays only",
  "Flexible / Remote only",
];

const LANGUAGES = ["Sesotho", "IsiZulu", "English", "Other (Specify)"];

const WHY_VOLUNTEER = [
  {
    Icon: BookOpen,
    title: "Make a Real Impact",
    body: "Directly change the trajectory of a young person's life. One hour a week can help a child fall in love with reading.",
  },
  {
    Icon: Handshake,
    title: "Join a Movement",
    body: "Become part of a passionate community of educators, professionals, and changemakers in Evaton West.",
  },
  {
    Icon: Sprout,
    title: "Grow Your Skills",
    body: "Develop coaching, communication, and leadership skills while giving back to your community.",
  },
  {
    Icon: Trophy,
    title: "Recognised Service",
    body: "Receive a volunteer recognition letter after 3 months of service — valuable for your CV or CSI reporting.",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Submit Your Application",
    body: "Fill in the form below. We'll receive your details and review your availability and interests.",
  },
  {
    step: "02",
    title: "We'll Be In Touch",
    body: "Expect a reply from our team within 3–5 working days to confirm your role and induction date.",
  },
  {
    step: "03",
    title: "Start Volunteering",
    body: "Attend a short orientation, meet the team, and begin making a difference from your very first session.",
  },
];

export default function VolunteerPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [availability, setAvailability] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [qualFile, setQualFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !role || !availability) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("firstName", firstName.trim());
    formData.append("lastName", lastName.trim());
    formData.append("email", email.trim());
    formData.append("phone", phone.trim());
    formData.append("role", role);
    formData.append("availability", availability);
    formData.append("languages", JSON.stringify(languages));
    formData.append("message", message.trim());
    if (cvFile) formData.append("cv", cvFile, cvFile.name);
    if (qualFile) formData.append("qualification", qualFile, qualFile.name);

    try {
      const result = await submitVolunteerApplication(formData);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-br from-brand-navy to-brand-teal py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-brand-light-teal text-sm font-semibold uppercase tracking-widest mb-4">
            Get Involved
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Join the{" "}
            <span className="text-brand-orange">Mission</span>
          </h1>
          <p className="text-gray-200 text-lg leading-relaxed">
            Volunteering with Tshiamiso Astronauts means giving your time, skills,
            and energy to close the literacy gap — one learner at a time.
          </p>
        </div>
      </section>

      {/* WHY VOLUNTEER */}
      <section className="py-20 px-6 bg-brand-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">
              Why Volunteer With Us?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Your skills and time are one of the most valuable gifts you can offer.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_VOLUNTEER.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-navy flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-brand-orange" size={22} strokeWidth={2} />
                </div>
                <h3 className="text-brand-navy font-bold text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VOLUNTEER ROLES */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">
              Where Can You Help?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              We have volunteer roles across all 9 of our programmes — in-person in
              Evaton West and remote.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ROLES.map((r) => (
              <div
                key={r}
                className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-brand-orange flex-shrink-0" />
                <span className="text-brand-navy font-semibold text-sm">{r}</span>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 bg-brand-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROCESS_STEPS.map(({ step, title, body }) => (
              <div key={step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-orange text-white font-bold text-xl mb-4">
                  {step}
                </div>
                <h3 className="text-brand-navy font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">
              Apply to Volunteer
            </h2>
            <p className="text-gray-500">
              Complete the form below and we will be in touch within 3–5 working days.
            </p>
          </div>

          {submitted ? (
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-navy flex items-center justify-center mx-auto mb-4">
                <Rocket className="text-brand-orange" size={32} strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold text-brand-navy mb-2">
                Application Received!
              </h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Thank you, {firstName}! We have received your volunteer application and
                will be in touch at{" "}
                <span className="text-brand-teal font-semibold">{email}</span> within
                3–5 working days.
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-brand-navy font-bold text-lg">Your Details</h3>
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

              {/* Role & Availability */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-brand-navy font-bold text-lg">Your Preferences</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Preferred Role *
                  </label>
                  <select
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-brand-navy focus:outline-none focus:border-brand-teal bg-white"
                  >
                    <option value="">Select a role…</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Availability *
                  </label>
                  <select
                    required
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-brand-navy focus:outline-none focus:border-brand-teal bg-white"
                  >
                    <option value="">Select availability…</option>
                    {AVAILABILITY.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Language Proficiency
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map((lang) => (
                      <label key={lang} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={languages.includes(lang)}
                          onChange={(e) =>
                            setLanguages(
                              e.target.checked
                                ? [...languages, lang]
                                : languages.filter((l) => l !== lang)
                            )
                          }
                          className="w-4 h-4 accent-brand-teal"
                        />
                        <span className="text-sm text-brand-navy">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Why do you want to join the &apos;Year of Breakthrough&apos; and help children in Evaton West read for meaning?
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your background, skills, and motivation…"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-brand-navy focus:outline-none focus:border-brand-teal resize-none"
                  />
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-brand-navy font-bold text-lg">Documents</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Upload Your CV
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-navy file:text-white hover:file:opacity-90 cursor-pointer"
                  />
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC or DOCX</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Highest Qualification
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setQualFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-navy file:text-white hover:file:opacity-90 cursor-pointer"
                  />
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX or image</p>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm font-semibold text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-teal text-white font-bold py-5 rounded-xl text-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting…" : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* DONATE NUDGE */}
      <section className="py-16 px-6 bg-brand-orange text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-3">
            Can&apos;t volunteer right now?
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            A financial donation is equally powerful. Every rand funds books, tutors,
            and digital access for learners in Evaton West.
          </p>
          <Link
            href="/donate"
            className="inline-block bg-white text-brand-orange font-bold px-10 py-4 rounded-xl text-lg hover:opacity-90 transition-opacity"
          >
            Donate Instead
          </Link>
        </div>
      </section>
    </>
  );
}
