"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cookie-consent");
    if (!stored) setVisible(true);
  }, []);

  // The notice is for information only. Nothing reads this value to switch tools on or off;
  // it just stops the notice showing again.
  function dismiss() {
    localStorage.setItem("cookie-consent", "acknowledged");
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
          We use cookies and similar tools on every page for website
          performance and Google Ads measurement, which shows us whether our
          adverts lead to donations and messages. We also collect personal
          information through our donation, contact, and volunteer forms. This
          notice is for information and does not switch these tools off. To
          block them, use your browser settings. Your information is handled in accordance with South Africa&apos;s{" "}
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
            onClick={dismiss}
            className="bg-brand-orange text-white text-sm font-bold px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
