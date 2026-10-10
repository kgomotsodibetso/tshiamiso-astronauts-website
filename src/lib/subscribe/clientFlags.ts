import { POPUP_SNOOZE_MS, POPUP_STORAGE } from "@/config/subscribe";

// Pop-up memory. localStorage/sessionStorage only, no personal data. Every call is guarded:
// storage can be blocked (private windows, blocked site data) and the page must still work.

function read(store: "local" | "session", key: string): string | null {
  try {
    return (store === "local" ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}
function write(store: "local" | "session", key: string, value: string) {
  try {
    (store === "local" ? window.localStorage : window.sessionStorage).setItem(key, value);
  } catch {
    /* ignore */
  }
}

export const isSubscribed = () => read("local", POPUP_STORAGE.done) !== null;
export const markSubscribed = () => write("local", POPUP_STORAGE.done, "1");

export function isSnoozed(now = Date.now()): boolean {
  const at = Number(read("local", POPUP_STORAGE.dismissed));
  return Number.isFinite(at) && at > 0 && now - at < POPUP_SNOOZE_MS;
}
export const snooze = (now = Date.now()) => write("local", POPUP_STORAGE.dismissed, String(now));

export const shownThisSession = () => read("session", POPUP_STORAGE.session) !== null;
export const markShownThisSession = () => write("session", POPUP_STORAGE.session, "1");

export const cookieNoticeAnswered = () => read("local", "cookie-consent") !== null;
