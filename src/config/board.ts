// Everything the Board recruitment pages (/board, /board/apply, /board/nominate) need to decide.
// IDs and dates are not secrets. The Monday.com token lives in Vercel env vars only (MONDAY_API_TOKEN).

// Applications and nominations close at this moment. After it the pages show the closed state.
// This is the ONE place the close date lives. The server-side refusal (isBoardClosed), the closed state and every
// date shown on the pages and in the emails are built from it, so change it here and nowhere else.
// The call-out was extended by three months on 24 Nov 2026.
export const BOARD_CLOSE_AT = new Date("2027-02-26T23:59:00+02:00");

// South Africa has no daylight saving, so SAST is always UTC+2. Doing the sum by hand keeps these strings
// identical on every server, with no dependence on the runtime's locale data.
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function sastParts(d: Date) {
  const s = new Date(d.getTime() + 2 * 60 * 60 * 1000);
  return { weekday: WEEKDAYS[s.getUTCDay()], day: s.getUTCDate(), month: MONTHS[s.getUTCMonth()], year: s.getUTCFullYear() };
}

// "Friday 26 February 2027". Used in the banners, metadata, FAQ-style text and the emails.
export function boardCloseDate(close: Date = BOARD_CLOSE_AT): string {
  const p = sastParts(close);
  return `${p.weekday} ${p.day} ${p.month} ${p.year}`;
}
// "Friday 26 February". Used where the year is already obvious, such as the How it works steps.
export function boardCloseDayMonth(close: Date = BOARD_CLOSE_AT): string {
  const p = sastParts(close);
  return `${p.weekday} ${p.day} ${p.month}`;
}
export const BOARD_CLOSE_DATE = boardCloseDate();
export const BOARD_CLOSE_DAY_MONTH = boardCloseDayMonth();

// Plain-words timing that follows the close date. No exact dates: interview and members' meeting dates are not published.
export const BOARD_SCREENING_WHEN = "early March";
export const BOARD_MEETING_WHEN = "after the interviews";

// "Deadline extended" ribbon at the top of /board, for returning visitors. Shown until the end of Fri 1 Jan 2027
// (SAST), then hidden by date with no deploy needed.
export const BOARD_EXTENSION_NOTICE_UNTIL = new Date("2027-01-01T23:59:59+02:00");
export const BOARD_EXTENSION_NOTICE = `Good news: the deadline has been extended to ${BOARD_CLOSE_DATE}.`;
export function showBoardExtensionNotice(now: Date = new Date()): boolean {
  return now.getTime() <= BOARD_EXTENSION_NOTICE_UNTIL.getTime();
}

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
