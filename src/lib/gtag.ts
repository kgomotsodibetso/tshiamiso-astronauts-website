// Google Ads conversion events (account 575-289-6358).
// The Google tag (G-DCD6HVVNF5, with AW-17669058060 as a destination) is NOT loaded from this
// code. It is served from our own /metrics/ path and set up at Cloudflare level, and it defines
// window.gtag on every page. Do not add a second gtag.js here: it would double-count.
// Never pass names, emails or amounts to these events (POPIA, no personal data).

export const GOOGLE_ADS_ID = "AW-17669058060";

// "TA Donation Started (PayFast)" - fired on /donate just before the PayFast redirect.
export const DONATION_STARTED_SEND_TO = `${GOOGLE_ADS_ID}/DOLwCI7Dl5YdEIzcoelB`;

// "TA Contact Form Submitted" - fired on /contact after the success state.
export const CONTACT_FORM_SEND_TO = `${GOOGLE_ADS_ID}/dUtxCLCbl5YdEIzcoelB`;

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

/**
 * Fires a Google Ads conversion event through the existing window.gtag, if there is one.
 * If gtag is missing (ad blocker, tag not loaded) nothing is sent and nothing breaks.
 *
 * If `onDone` is given it runs exactly once: when Google confirms the event (event_callback),
 * after `timeoutMs` if it has not, or straight away if gtag is unavailable. This keeps the
 * PayFast redirect from ever being blocked or held up for more than about a second.
 */
export function trackConversion(
  sendTo: string,
  onDone?: () => void,
  timeoutMs = 1000,
): void {
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    onDone?.();
  };

  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    finish();
    return;
  }

  if (onDone) window.setTimeout(finish, timeoutMs);

  try {
    window.gtag("event", "conversion", onDone ? { send_to: sendTo, event_callback: finish } : { send_to: sendTo });
  } catch {
    finish();
  }
}
