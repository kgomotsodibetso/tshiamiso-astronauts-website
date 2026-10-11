// Everything the /join page needs to know. IDs and wording are not secrets.
// The sign-up form address lives in an environment variable so it can be swapped without a code change.

export const JOIN_SOURCES = ["flyer", "poster", "card", "desk", "school", "social", "whatsapp"] as const;
export type JoinSource = (typeof JOIN_SOURCES)[number] | "other";

export const SUPPORT_EMAIL = "info@tshiamisoastronauts.org";
export const JOIN_PATH = "/join";

export type JoinFormConfig = {
  /** The live sign-up form (monday WorkForm). Empty until Cowork confirms the form is ready. */
  formUrl: string | null;
  /**
   * Optional. The name of the form's source field, if the form can be pre-filled from the link
   * (for example "Source"). When empty, the source is not passed to the form and is only counted here.
   */
  sourceParam: string | null;
  /** Optional. Shown in the "not open yet" message, for example "Monday 13 October". */
  opensOn: string | null;
};

// Read at request time, never at build time, so a changed variable is picked up by the next deployment.
export function getJoinFormConfig(): JoinFormConfig {
  const raw = process.env.JOIN_FORM_URL?.trim() ?? "";
  let formUrl: string | null = null;
  try {
    if (raw) {
      const u = new URL(raw);
      if (u.protocol === "https:") formUrl = u.toString();
    }
  } catch {
    formUrl = null;
  }
  const sourceParam = process.env.JOIN_FORM_SOURCE_PARAM?.trim() || null;
  const opensOn = process.env.JOIN_FORM_OPENS_ON?.trim() || null;
  return { formUrl, sourceParam, opensOn };
}
