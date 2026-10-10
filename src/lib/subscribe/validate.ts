import {
  AUDIENCES,
  DEFAULT_AUDIENCE,
  LANGUAGES,
  MESSAGES,
  MIN_FORM_TIME_MS,
  PLACEMENTS,
  SRC_ALLOW_LIST,
  TOPIC_KEYS,
  type AudienceKey,
  type LanguageKey,
  type Placement,
  type SubscribeVariant,
  type TopicKey,
} from "@/config/subscribe";

export interface SubscribeBody {
  variant?: unknown;
  firstName?: unknown;
  email?: unknown;
  audience?: unknown;
  topics?: unknown;
  language?: unknown;
  consent?: unknown;
  placement?: unknown;
  src?: unknown;
  page?: unknown;
  website?: unknown; // honeypot
  elapsedMs?: unknown; // time the form has been on screen (ms), measured in the browser
  turnstileToken?: unknown;
}

export interface CleanSignup {
  variant: SubscribeVariant;
  firstName: string;
  email: string;
  audience: AudienceKey;
  topics: TopicKey[];
  language: LanguageKey | null;
  placement: Placement;
  src: string | null;
  page: string;
}

export type Validation =
  | { ok: true; value: CleanSignup }
  | { ok: false; error: string; field?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const asString = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max + 1) : "");

export function validateSignup(body: SubscribeBody): Validation {
  const variant: SubscribeVariant = body.variant === "full" ? "full" : "short";

  const firstName = asString(body.firstName, 60).replace(/[\r\n\t<>]/g, " ").replace(/\s+/g, " ").trim();
  if (!firstName || firstName.length > 60) return { ok: false, error: MESSAGES.invalidName, field: "firstName" };

  const email = asString(body.email, 254).toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return { ok: false, error: MESSAGES.invalidEmail, field: "email" };
  }

  if (body.consent !== true) return { ok: false, error: MESSAGES.noConsent, field: "consent" };

  let topics: TopicKey[];
  let audience: AudienceKey = DEFAULT_AUDIENCE;
  let language: LanguageKey | null = null;

  if (variant === "full") {
    const requested = Array.isArray(body.topics) ? body.topics : [];
    topics = TOPIC_KEYS.filter((k) => requested.includes(k));
    if (topics.length === 0) return { ok: false, error: MESSAGES.noTopic, field: "topics" };
    if (typeof body.audience === "string" && body.audience in AUDIENCES) audience = body.audience as AudienceKey;
    if (typeof body.language === "string" && body.language in LANGUAGES) language = body.language as LanguageKey;
  } else {
    topics = ["newsletter"];
  }

  const placement: Placement = PLACEMENTS.includes(body.placement as Placement)
    ? (body.placement as Placement)
    : variant === "full"
      ? "subscribe-page"
      : "footer";
  const src = typeof body.src === "string" && (SRC_ALLOW_LIST as readonly string[]).includes(body.src.toLowerCase())
    ? body.src.toLowerCase()
    : null;

  // Path only (no query string, no host): stored with the consent record.
  const rawPage = asString(body.page, 200);
  const page = rawPage.startsWith("/") && !rawPage.startsWith("//") ? rawPage.split(/[?#]/)[0].slice(0, 200) : "/";

  return { ok: true, value: { variant, firstName, email, audience, topics, language, placement, src, page } };
}

// Bot signals. A filled honeypot gets a silent fake success (bots learn nothing). A submit faster
// than a person could type is a retryable error instead, so a fast autofill is never silently lost.
// Elapsed time is measured on the visitor's device (performance.now), so a wrong clock cannot trip it.
export const honeypotFilled = (body: SubscribeBody) => typeof body.website === "string" && body.website.trim() !== "";

export const submittedTooFast = (body: SubscribeBody) =>
  !(typeof body.elapsedMs === "number" && Number.isFinite(body.elapsedMs) && body.elapsedMs >= MIN_FORM_TIME_MS);
