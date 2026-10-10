import {
  CONSENT_DEFAULT_DENIED_REGIONS,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  GOOGLE_CONSENT_SIGNALS,
  type StoredConsent,
} from "@/config/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Runs in <head> before anything else, so Google's tag never sees a visit without a consent state.
 * - A saved choice is applied as the default for everyone.
 * - Otherwise: denied in the EU, UK, Switzerland and EEA until the visitor accepts; granted elsewhere
 *   (South Africa and the rest of the world keep working as before, and the banner still offers Reject).
 * It does not define window.gtag, so the site's conversion code behaves exactly as before.
 */
export function consentInitScript(): string {
  const signals = JSON.stringify(GOOGLE_CONSENT_SIGNALS);
  const regions = JSON.stringify(CONSENT_DEFAULT_DENIED_REGIONS);
  return `(function(){try{
var w=window;w.dataLayer=w.dataLayer||[];
function g(){w.dataLayer.push(arguments)}
var sig=${signals};
function all(v){var o={};for(var i=0;i<sig.length;i++){o[sig[i]]=v}return o}
var s=null;try{s=JSON.parse(w.localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)}))}catch(e){}
if(s&&s.v===${CONSENT_VERSION}&&typeof s.ads==="boolean"){g("consent","default",all(s.ads?"granted":"denied"))}
else{var d=all("denied");d.region=${regions};d.wait_for_update=500;g("consent","default",d);g("consent","default",all("granted"))}
g("set","ads_data_redaction",true);
}catch(e){}})();`;
}

export function readConsent(): StoredConsent | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    return parsed && parsed.v === CONSENT_VERSION && typeof parsed.ads === "boolean" ? parsed : null;
  } catch {
    return null;
  }
}

// gtag commands must be pushed as an `arguments` object, which is why this is a plain function.
const gtagPush = function () {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
} as (...args: unknown[]) => void;

/** Saves the visitor's choice and tells Google. Works whether or not the Google tag has loaded yet. */
export function saveConsent(ads: boolean): void {
  const value: StoredConsent = { v: CONSENT_VERSION, ads, at: new Date().toISOString() };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage blocked: the choice still applies for this visit */
  }
  const state: Record<string, string> = {};
  for (const s of GOOGLE_CONSENT_SIGNALS) state[s] = ads ? "granted" : "denied";
  gtagPush("consent", "update", state);
}
