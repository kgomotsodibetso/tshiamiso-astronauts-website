// Google Ads conversion tracking (account 575-289-6358).
// The Google tag itself is loaded once, site-wide, in src/app/layout.tsx.
// Never pass names, emails or amounts to these events (POPIA, no personal data).

export const GOOGLE_ADS_ID = "AW-17669058060";

export const COOKIE_CONSENT_KEY = "cookie-consent";

// "TA Donation Started (PayFast)" - fired on /donate just before the PayFast redirect.
export const DONATION_STARTED_SEND_TO = `${GOOGLE_ADS_ID}/DOLwCI7Dl5YdEIzcoelB`;

// "TA Contact Form Submitted" - fired on /contact after the success state.
// TODO(Motso): replace CONTACT_LABEL_TO_FOLLOW with the conversion label from Google Ads
// (Goals > Conversions > TA Contact Form Submitted > Tag setup). Until it is replaced, no
// contact conversion is sent.
export const CONTACT_FORM_SEND_TO = `${GOOGLE_ADS_ID}/CONTACT_LABEL_TO_FOLLOW`;

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

/**
 * Fires a Google Ads conversion event.
 *
 * If `onDone` is given it runs exactly once: when Google confirms the event was sent
 * (event_callback), or after `timeoutMs` if it has not, or straight away if the tag is
 * unavailable (ad blocker, script failed). This keeps redirects from being held up.
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
    window.gtag("event", "conversion", {
      send_to: sendTo,
      event_callback: finish,
    });
  } catch {
    finish();
  }
}

/** True once the contact label has been swapped in. */
export function isConversionConfigured(sendTo: string): boolean {
  return !sendTo.includes("TO_FOLLOW");
}

/** Tells the Google tag what the visitor chose on the cookie banner. */
export function updateAdsConsent(accepted: boolean): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const value = accepted ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
}
