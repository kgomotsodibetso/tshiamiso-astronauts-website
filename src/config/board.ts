// Everything the Board recruitment pages (/board, /board/apply, /board/nominate) need to decide.
// IDs and dates are not secrets. The Monday.com token lives in Vercel env vars only (MONDAY_API_TOKEN).

// Applications and nominations close at this moment. After it the pages show the closed state.
export const BOARD_CLOSE_AT = new Date("2026-11-27T23:59:00+02:00");

// Backing boards (workspace "Tshiamiso Astronauts: Mission 2026"). Private boards: the token's monday
// user must be able to write to them. Overridable by env var if a board is ever replaced.
export const BOARD_MONDAY = {
  applicationsBoardId: process.env.MONDAY_BOARD_APPLICATIONS_ID || "5105990151",
  nominationsBoardId: process.env.MONDAY_BOARD_NOMINATIONS_ID || "5105990187",
} as const;

// Where a visitor came from. Anything not on this list becomes "other". The raw value is never shown.
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

export function resolveBoardSource(raw: unknown): BoardSource {
  const first = Array.isArray(raw) ? raw[0] : raw;
  const value = typeof first === "string" ? first.trim().toLowerCase() : "";
  return (BOARD_SOURCES as readonly string[]).includes(value) ? (value as BoardSource) : "other";
}

export type BoardState = "open" | "closed";

export function isProductionDeployment(): boolean {
  return process.env.VERCEL_ENV === "production";
}

// The clock alone decides, with no override. Server actions use this, so nothing is accepted after closing.
export function isBoardClosed(now: Date = new Date()): boolean {
  return now.getTime() > BOARD_CLOSE_AT.getTime();
}

// In production the state follows the clock only. On preview and local builds `?state=closed`
// (or `?state=open`) lets Motso see both versions of the pages.
export function resolveBoardState(
  override: string | string[] | undefined,
  now: Date = new Date(),
  production: boolean = isProductionDeployment(),
): { state: BoardState; overridden: boolean } {
  const byClock: BoardState = isBoardClosed(now) ? "closed" : "open";
  if (!production) {
    const value = (Array.isArray(override) ? override[0] : override)?.trim().toLowerCase();
    if (value === "closed" || value === "open") return { state: value, overridden: value !== byClock };
  }
  return { state: byClock, overridden: false };
}

// Internal link that carries the allow-listed source code (and the preview-only state switch) along.
export function boardPath(path: string, source: BoardSource, state?: BoardState): string {
  const q = new URLSearchParams({ s: source });
  if (state) q.set("state", state);
  return `${path}?${q.toString()}`;
}

// Choice lists. The position in each list is the Monday.com status label index, so keep the order
// exactly as on the board columns.
export const SKILL_AREAS = [
  "Finance, audit and tax",
  "Legal and governance",
  "Fundraising and partnerships",
  "Education and literacy",
  "Community voice",
  "Other",
] as const;
export const GENDERS = ["Female", "Male", "Another identity", "Prefer not to say"] as const;
export const LINKS_TO_TA = [
  "Member",
  "Volunteer or tutor",
  "Parent or guardian",
  "Donor or sponsor",
  "Partner organisation",
  "Alumni",
  "No link yet",
] as const;
export const COMMITTEES = [
  "Audit and Risk",
  "Board Nominations and Human Resources",
  "Programmes and Technical",
  "No preference",
] as const;
export const NOMINEE_KNOWS = ["Yes", "No", "Not sure"] as const;

export const WHY_MAX_WORDS = 150;
export const CV_MAX_BYTES = 3 * 1024 * 1024; // Vercel allows about 4.5 MB per request, so keep headroom.
