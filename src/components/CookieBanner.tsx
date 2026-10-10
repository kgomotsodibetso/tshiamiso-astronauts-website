"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { COOKIE_ACK_EVENT, OPEN_COOKIE_SETTINGS_EVENT } from "@/config/consent";
import { readConsent, saveConsent } from "@/lib/consent";

const buttonBase =
  "min-h-[44px] min-w-[8.5rem] rounded-lg px-6 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-light-teal";

// Cookie choices for Google Ads measurement. Accept and Reject are the same size and equally easy to
// reach. Nothing is switched on in the EU, UK or Switzerland until the visitor accepts. The choice can be
// changed at any time from "Cookie settings" in the footer.
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!readConsent()) setVisible(true);
    const reopen = () => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setVisible(true);
      window.setTimeout(() => boxRef.current?.focus(), 0);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  const choose = useCallback((ads: boolean) => {
    saveConsent(ads);
    setVisible(false);
    // Lets the subscribe pop-up know the notice has been answered.
    window.dispatchEvent(new Event(COOKIE_ACK_EVENT));
    returnFocus.current?.focus?.();
    returnFocus.current = null;
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={boxRef}
      tabIndex={-1}
      role="dialog"
      aria-label="Cookie choices"
      aria-describedby="cookie-choices-text"
      className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-brand-teal bg-brand-navy px-4 py-5 focus:outline-none sm:px-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center">
        <div id="cookie-choices-text" className="flex-1 text-sm leading-relaxed text-gray-200">
          <p className="font-bold text-white">Your cookie choices</p>
          <p className="mt-1">
            We use Google Ads cookies to measure which of our adverts lead to donations and messages. In the EU, UK
            and Switzerland nothing is switched on until you accept. You can change your choice at any time from
            Cookie settings in the footer.{" "}
            <Link href="/privacy" className="text-brand-light-teal underline hover:text-white">
              Read our Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-3">
          <button type="button" onClick={() => choose(false)} className={`${buttonBase} bg-brand-white text-brand-navy`}>
            Reject
          </button>
          <button type="button" onClick={() => choose(true)} className={`${buttonBase} bg-brand-orange text-brand-navy`}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
