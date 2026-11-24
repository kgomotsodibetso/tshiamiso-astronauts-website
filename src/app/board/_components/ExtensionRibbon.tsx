"use client";

import { useEffect, useLayoutEffect, useState } from "react";

// Remembers a dismissal for this browser tab only. No personal data. Storage can be blocked (private windows,
// blocked site data), so every call is guarded and the ribbon simply shows again if it cannot be read.
const STORAGE_KEY = "ta_board_extension_ribbon_dismissed";
const RIBBON_ID = "ta-board-extension-ribbon";

// Runs while the page is still being read, before anything is painted, so a visitor who already dismissed the
// ribbon never sees it flash back while the page loads. React then removes it for good once it takes over.
const HIDE_BEFORE_PAINT = `try{if(window.sessionStorage.getItem(${JSON.stringify(STORAGE_KEY)})){var r=document.getElementById(${JSON.stringify(RIBBON_ID)});if(r)r.hidden=true}}catch(e){}`;

// useLayoutEffect on the browser (runs before paint on in-site navigation), plain useEffect on the server.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function wasDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
function rememberDismissed() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Plain-text notice at the top of /board for returning visitors. Navy text on orange, as on the Apply button.
 * The page decides by date whether to render it at all. This only handles the Dismiss button.
 */
export default function ExtensionRibbon({ text, focusId }: { text: string; focusId?: string }) {
  const [dismissed, setDismissed] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (wasDismissed()) setDismissed(true);
  }, []);

  if (dismissed) return null;

  function dismiss() {
    rememberDismissed();
    setDismissed(true);
    // The button is about to disappear. Hand focus to the page heading so keyboard users are not dropped at the top.
    if (focusId) document.getElementById(focusId)?.focus();
  }

  return (
    <>
      {/* suppressHydrationWarning: the inline script below may add `hidden` before React takes over. */}
      <div id={RIBBON_ID} role="region" aria-label="Deadline extended" className="bg-brand-orange text-brand-navy" suppressHydrationWarning>
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 lg:px-8">
          <p className="text-base font-bold leading-snug">{text}</p>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center self-start rounded-md border-2 border-brand-navy px-4 text-sm font-bold transition-colors hover:bg-brand-navy hover:text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-brand-navy sm:self-auto"
          >
            Dismiss
            <span className="sr-only"> this notice</span>
          </button>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: HIDE_BEFORE_PAINT }} />
    </>
  );
}
