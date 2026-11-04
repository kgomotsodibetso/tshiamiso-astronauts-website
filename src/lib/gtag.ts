// Google Ads conversion events (account 575-289-6358).
// The Google tag (G-DCD6HVVNF5, with AW-17669058060 as a destination) is NOT loaded from this
// code. It is served from our own /metrics/ path and set up at Cloudflare level, and it defines
// window.gtag on every page. Do not add a second gtag.js here: it would double-count.
// Never pass names, emails or amounts to these events (POPIA, no personal data).

import { readConsent } from "@/lib/consent";

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

// ---------------------------------------------------------------------------------------------
// Board recruitment conversions (Google Ad Grants campaign, November 2026).
// Motso creates the two conversion actions in Google Ads and passes the labels. Paste each label (the
// part after "AW-17669058060/") below. While a label is empty, nothing is sent for that form.
//   "TA Board Application Submitted"  -> fired on /board/apply after the server confirms the save
//   "TA Board Nomination Submitted"   -> fired on /board/nominate after the server confirms the save
// ---------------------------------------------------------------------------------------------
const BOARD_APPLICATION_LABEL = "";
const BOARD_NOMINATION_LABEL = "";

export const BOARD_APPLICATION_SEND_TO = BOARD_APPLICATION_LABEL ? `${GOOGLE_ADS_ID}/${BOARD_APPLICATION_LABEL}` : "";
export const BOARD_NOMINATION_SEND_TO = BOARD_NOMINATION_LABEL ? `${GOOGLE_ADS_ID}/${BOARD_NOMINATION_LABEL}` : "";

// Whether the visitor's cookie choice allows Google Ads measurement. This follows the same rule as the
// cookie banner and Clarity: a saved choice wins; with no choice yet, the EEA and UK (and any visitor whose
// country cannot be told) count as "not allowed", everywhere else as "allowed".
async function adsMeasurementAllowed(): Promise<boolean> {
  const choice = readConsent();
  if (choice) return choice.ads === true;
  try {
    const res = await fetch("/api/region", { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { optIn?: boolean };
    return data.optIn === false;
  } catch {
    return false;
  }
}

/**
 * Fires one Board conversion, only if the visitor's cookie choice allows it. Nothing is sent when they
 * declined, or when the label has not been set yet. No personal data is sent: the event carries only the
 * conversion id and a random transaction_id (a throwaway code that lets Google ignore a repeat of the same
 * submission; it is not linked to the visitor or to anything they typed).
 */
export async function trackBoardConversion(sendTo: string): Promise<void> {
  if (!sendTo || typeof window === "undefined" || typeof window.gtag !== "function") return;
  if (!(await adsMeasurementAllowed())) return;
  try {
    window.gtag("event", "conversion", { send_to: sendTo, transaction_id: crypto.randomUUID() });
  } catch {
    /* tracking must never get in the way of the confirmation the visitor sees */
  }
}
