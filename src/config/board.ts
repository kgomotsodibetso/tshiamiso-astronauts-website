// Everything the /board (Board recruitment) page needs to decide. No personal data is collected here:
// the Monday.com forms hold all candidate details. IDs and dates are not secrets.
// The form links and the source switch come from environment variables (see .env.example).

// Applications and nominations close at this moment. After it the page shows the closed state.
export const BOARD_CLOSE_AT = new Date("2026-11-27T23:59:00+02:00");

// Where a visitor came from. Anything not on this list becomes "other". The raw value is never shown or stored.
export const BOARD_SOURCES = [
  "poster",
  "card",
  "email",
  "social",
  "whatsapp",
  "gala",
  "referral",
  "website",
] as const;
export type BoardSource = (typeof BOARD_SOURCES)[number] | "other";

export function resolveBoardSource(raw: string | string[] | undefined): BoardSource {
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase();
  return (BOARD_SOURCES as readonly string[]).includes(value ?? "") ? (value as BoardSource) : "other";
}

export type BoardState = "open" | "closed";

export function isProductionDeployment(): boolean {
  return process.env.VERCEL_ENV === "production";
}

// In production the state follows the clock only. On preview and local builds `?state=closed`
// (or `?state=open`) lets Motso see both versions.
export function resolveBoardState(
  override: string | string[] | undefined,
  now: Date = new Date(),
  production: boolean = isProductionDeployment(),
): { state: BoardState; overridden: boolean } {
  const byClock: BoardState = now.getTime() > BOARD_CLOSE_AT.getTime() ? "closed" : "open";
  if (!production) {
    const value = (Array.isArray(override) ? override[0] : override)?.trim().toLowerCase();
    if (value === "closed" || value === "open") return { state: value, overridden: value !== byClock };
  }
  return { state: byClock, overridden: false };
}

// Accepts only a well-formed https link. Anything else counts as "not set".
function readFormUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export type BoardForms = {
  apply: string | null;
  nominate: string | null;
  passSource: boolean;
};

export function getBoardForms(): BoardForms {
  return {
    apply: readFormUrl(process.env.BOARD_APPLY_URL),
    nominate: readFormUrl(process.env.BOARD_NOMINATE_URL),
    passSource: process.env.BOARD_PASS_SOURCE === "true",
  };
}

// The button target. With BOARD_PASS_SOURCE=true the allow-listed source code rides along as ?s=<code>.
export function withSource(formUrl: string, passSource: boolean, source: BoardSource): string {
  if (!passSource) return formUrl;
  const url = new URL(formUrl);
  url.searchParams.set("s", source);
  return url.toString();
}
