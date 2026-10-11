// Everything the /join page needs to know. IDs and wording are not secrets.
// The sign-up form address lives in an environment variable so it can be swapped without a code change.

export const JOIN_SOURCES = ["flyer", "poster", "card", "desk", "school", "social", "whatsapp"] as const;
export type JoinSource = (typeof JOIN_SOURCES)[number] | "other";

export const SUPPORT_EMAIL = "info@tshiamisoastronauts.org";
export const JOIN_PATH = "/join";

// The live sign-up form (monday WorkForm "Join the Astronauts", built by Cowork 11 Oct 2026).
// Its hidden "Source code" question fills itself from the URL parameter `s`.
// Short link: https://wkf.ms/3W2F1SO (not tested with ?s= yet, so the full form address is the default).
// To swap it (for example for the native form in Phase 2), set JOIN_FORM_URL. No code change needed.
const DEFAULT_FORM_URL = "https://forms.monday.com/forms/f5e144fb7215dabb550ce6e4abced7c6";
const DEFAULT_SOURCE_PARAM = "s";

export type JoinFormConfig = {
  /** The sign-up form. Null only if JOIN_FORM_URL is set to something that is not a valid https address. */
  formUrl: string | null;
  /** The URL parameter the form reads its source from. */
  sourceParam: string;
  /** Optional. Shown in the "not open yet" message, for example "Monday 13 October". */
  opensOn: string | null;
};

// Read at request time, never at build time, so a changed variable is picked up by the next deployment.
export function getJoinFormConfig(): JoinFormConfig {
  const raw = process.env.JOIN_FORM_URL?.trim() || DEFAULT_FORM_URL;
  let formUrl: string | null = null;
  try {
    const u = new URL(raw);
    if (u.protocol === "https:") formUrl = u.toString();
  } catch {
    formUrl = null;
  }
  const sourceParam = process.env.JOIN_FORM_SOURCE_PARAM?.trim() || DEFAULT_SOURCE_PARAM;
  const opensOn = process.env.JOIN_FORM_OPENS_ON?.trim() || null;
  return { formUrl, sourceParam, opensOn };
}
