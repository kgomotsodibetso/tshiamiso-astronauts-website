"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { buildPayFastPayload } from "./actions";

const PRESET_AMOUNTS = [100, 250, 500, 1000];

export default function DonatePage() {
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(250);
  const [customAmount, setCustomAmount] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  const finalAmount =
    selectedAmount !== null ? selectedAmount : parseFloat(customAmount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Please fill in your name and email address.");
      return;
    }
    if (!finalAmount || finalAmount < 10) {
      setError("Minimum donation is R10.");
      return;
    }

    setLoading(true);
    try {
      const { url, fields } = await buildPayFastPayload({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        amount: finalAmount,
        isRecurring,
      });

      // Build a hidden form and auto-submit to PayFast
      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;
      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("not configured")) {
        setError("Our payment system is temporarily unavailable. Please email info@tshiamisoastronauts.org to donate directly.");
      } else {
        setError(message || "Something went wrong. Please try again or email us at info@tshiamisoastronauts.org.");
      }
      setLoading(false);
    }
  }

  return (
    <>
      {/* HERO */}
      <section className="relative py-24 px-6 text-center">
        <Image
          src="/images/donate-page/donate-hero.jpg"
          alt="Tshiamiso Astronauts Donate"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-brand-navy/70" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-brand-light-teal text-sm font-semibold uppercase tracking-widest mb-4">
            Make a Difference
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Donate to{" "}
            <span className="text-brand-orange">Tshiamiso Astronauts</span>
          </h1>
          <p className="text-gray-200 text-lg leading-relaxed">
            Your donation funds books, tutors, digital training, and
            opportunities for children and youth in Evaton West. Every rand
            counts.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} ref={formRef} className="space-y-8">

            {/* Once-off / Monthly toggle */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-brand-navy font-bold text-lg mb-4">
                Donation Type
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Once-off", value: false },
                  { label: "Monthly", value: true },
                ].map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setIsRecurring(value)}
                    className={`py-3 rounded-xl font-bold text-sm transition-colors ${
                      isRecurring === value
                        ? "bg-brand-navy text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {isRecurring && (
                <p className="text-brand-teal text-xs mt-3">
                  Monthly donations are debited on the same date each month and
                  can be cancelled at any time.
                </p>
              )}
            </div>

            {/* Amount selector */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-brand-navy font-bold text-lg mb-4">
                Select Amount
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`py-4 rounded-xl font-bold text-lg transition-colors ${
                      selectedAmount === amt
                        ? "bg-brand-orange text-white"
                        : "bg-gray-100 text-brand-navy hover:bg-orange-50"
                    }`}
                  >
                    R{amt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  R
                </span>
                <input
                  type="number"
                  min={10}
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className="w-full pl-8 pr-4 py-4 border-2 border-gray-200 rounded-xl text-brand-navy font-bold text-lg focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>

            {/* Donor details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-brand-navy font-bold text-lg">Your Details</h2>
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-brand-navy focus:outline-none focus:border-brand-orange"
                    placeholder="Jane"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-brand-navy focus:outline-none focus:border-brand-orange"
                    placeholder="Smith"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-brand-navy focus:outline-none focus:border-brand-orange"
                  placeholder="jane@example.com"
                />
                <p className="text-gray-400 text-xs mt-1">
                  Your Section 18A tax receipt will be sent to this address.
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm font-semibold text-center">
                {error}
              </p>
            )}

            {/* Summary + Submit */}
            <div className="bg-brand-navy rounded-2xl p-6 text-center">
              {finalAmount >= 10 && (
                <p className="text-brand-light-teal text-sm mb-3">
                  You are about to {isRecurring ? "set up a monthly donation of" : "make a once-off donation of"}{" "}
                  <span className="text-white font-bold text-lg">
                    R{finalAmount.toLocaleString()}
                  </span>
                </p>
              )}
              <button
                type="submit"
                disabled={loading || !finalAmount || finalAmount < 10}
                className="w-full bg-brand-orange text-white font-bold py-5 rounded-xl text-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Redirecting to PayFast…"
                  : `Donate${finalAmount >= 10 ? ` R${finalAmount.toLocaleString()}` : ""}${isRecurring ? " / month" : ""}`}
              </button>
              <p className="text-gray-400 text-xs mt-3">
                Secure payment powered by PayFast. You will be redirected to
                complete your payment.
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="py-12 px-6 bg-brand-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-brand-orange font-bold text-sm mb-1">
              Section 18A Approved
            </p>
            <p className="text-gray-500 text-xs">
              Your donation is tax-deductible. PBO: 930083956
            </p>
          </div>
          <div>
            <p className="text-brand-orange font-bold text-sm mb-1">
              B-BBEE Level One
            </p>
            <p className="text-gray-500 text-xs">
              135% procurement recognition for corporates
            </p>
          </div>
          <div>
            <p className="text-brand-orange font-bold text-sm mb-1">
              Secure Payments
            </p>
            <p className="text-gray-500 text-xs">
              All transactions processed securely via PayFast
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
