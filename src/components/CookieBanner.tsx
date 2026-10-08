"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { COOKIE_CONSENT_KEY, updateAdsConsent } from "@/lib/gtag";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    updateAdsConsent(true);
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    updateAdsConsent(false);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and privacy notice"
      className="fixed bottom-0 left-0 right-0 z-50 bg-brand-navy border-t-2 border-brand-teal px-4 py-5 sm:px-6"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-300 flex-1 leading-relaxed">
          We use cookies and collect personal information to operate our website
          and process donations, contact enquiries, and volunteer applications.
          If you accept, we also use Google Ads cookies to measure whether our
          adverts lead to donations and messages. Your information is handled in accordance with South Africa&apos;s{" "}
          <strong className="text-white">
            Protection of Personal Information Act (POPIA)
          </strong>
          .{" "}
          <Link
            href="/privacy"
            className="text-brand-light-teal underline hover:text-white transition-colors"
          >
            Read our Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={accept}
            className="bg-brand-orange text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="border border-gray-500 text-gray-300 text-sm font-semibold px-5 py-2.5 rounded-lg hover:border-gray-300 hover:text-white transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
