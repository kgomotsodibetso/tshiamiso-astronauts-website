import { NextResponse, type NextRequest } from "next/server";
import { CONSENT_TEXT, CONSENT_VERSION, MESSAGES, TOKEN_TTL_MS } from "@/config/subscribe";
import { subscribeEmailRatelimit, subscribeIpRatelimit } from "@/lib/ratelimit";
import type { ConfirmPayload } from "@/lib/subscribe/confirm";
import { sendConfirmationEmail } from "@/lib/subscribe/resend";
import { siteUrl } from "@/lib/subscribe/siteUrl";
import { emailTag, sealToken } from "@/lib/subscribe/token";
import { verifyTurnstile } from "@/lib/subscribe/turnstile";
import { honeypotFilled, submittedTooFast, validateSignup, type SubscribeBody } from "@/lib/subscribe/validate";

export const dynamic = "force-dynamic";

const json = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

// Every refusal is logged with a reason (never the visitor's details) and returns a short code the
// form shows as "Ref: ..." so a screenshot is enough to see which check said no.
const refuse = (code: string, status: number, detail = "", error: string = MESSAGES.generic) => {
  console.warn(`[Subscribe] refused code=${code}${detail ? ` ${detail}` : ""}`);
  return json({ ok: false, error, code }, status);
};

// Same message every time, whether or not the address is already on our list.
const ALMOST_THERE = { ok: true } as const;

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return refuse("origin", 403, `origin=${req.headers.get("origin") ?? "none"} host=${req.headers.get("host") ?? "none"}`);
  }

  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return refuse("bad_request", 400, "body is not JSON");
  }
  if (!body || typeof body !== "object") return refuse("bad_request", 400, "body is not an object");

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || null;

  // 1. Cheap bot signals first. A filled honeypot gets the normal "Almost there" reply so bots
  //    learn nothing, but no email is sent. A too-fast submit gets a retryable error.
  if (honeypotFilled(body)) return json(ALMOST_THERE);
  if (submittedTooFast(body)) return refuse("too_fast", 400, `elapsedMs=${String(body.elapsedMs)}`);

  // 2. Turnstile. Missing or failed token = rejected.
  const human = await verifyTurnstile(body.turnstileToken, ip);
  if (!human.ok) return refuse("captcha", 400, `reason=${human.reason}`);

  // 3. Rate limits (fail open if Redis is unreachable; Turnstile still stands).
  try {
    const byIp = await subscribeIpRatelimit.limit(ip ?? "anonymous");
    if (!byIp.success) return refuse("rate_limit", 429, "ip", MESSAGES.tooMany);
  } catch (err) {
    console.warn("[Subscribe] IP rate limit check failed, failing open:", (err as Error).message);
  }

  // 4. Validate.
  const result = validateSignup(body);
  if (!result.ok) return json({ ok: false, error: result.error, field: result.field, code: "invalid" }, 400);
  const s = result.value;
  const tag = emailTag(s.email);

  // Per-address limit. Over the limit looks like success (no enumeration, no inbox flooding).
  try {
    const byEmail = await subscribeEmailRatelimit.limit(tag);
    if (!byEmail.success) return json(ALMOST_THERE);
  } catch (err) {
    console.warn("[Subscribe] Email rate limit check failed, failing open:", (err as Error).message);
  }

  // 5. Encrypted 48-hour token, then the confirmation email. Nothing is saved until the link is clicked.
  try {
    const payload: ConfirmPayload = {
      ...s,
      consentVersion: CONSENT_VERSION,
      consentText: CONSENT_TEXT[s.variant],
    };
    const token = sealToken("confirm", payload);
    const confirmUrl = `${siteUrl()}/subscribe/confirm?t=${token}`;
    await sendConfirmationEmail(s.email, s.firstName, confirmUrl);
    console.log(`[Subscribe] confirmation sent to ${tag} placement=${s.placement} ttlHours=${TOKEN_TTL_MS / 3_600_000}`);
    return json(ALMOST_THERE);
  } catch (err) {
    const msg = String((err as Error)?.message ?? err).replace(/[^\s@]+@[^\s@]+/g, "[email]");
    console.error(`[Subscribe] confirmation failed for ${tag}: ${msg}`);
    return json({ ok: false, error: MESSAGES.generic, code: "send_failed" }, 500);
  }
}
