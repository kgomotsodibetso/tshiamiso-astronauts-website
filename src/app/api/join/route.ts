import { createHmac } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { FAMILY_BOARD, JOIN_MESSAGES } from "@/config/join";
import { clientIpFrom } from "@/lib/clientIp";
import { createFamilyRow } from "@/lib/join/monday";
import { honeypotFilled, submittedTooFast, validateJoin, type JoinBody } from "@/lib/join/validate";
import { joinIpRatelimit, joinPhoneRatelimit } from "@/lib/ratelimit";
import { sendFamilySignupNotification } from "@/lib/resend";
import { verifyTurnstile } from "@/lib/subscribe/turnstile";

export const dynamic = "force-dynamic";

const json = (body: Record<string, unknown>, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

// Every refusal is logged with a reason, never with the family's details, and returns a short code the
// form shows as "Ref: ..." so a screenshot is enough to see which check said no.
const refuse = (code: string, status: number, detail = "", error: string = JOIN_MESSAGES.generic) => {
  console.warn(`[Join] refused code=${code}${detail ? ` ${detail}` : ""}`);
  return json({ ok: false, error, code }, status);
};

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

// A keyed hash of the cell number, used only as a rate-limit key so the number itself is never stored in Redis.
const phoneKey = (phone: string) =>
  createHmac("sha256", process.env.SUBSCRIBE_TOKEN_SECRET || process.env.TURNSTILE_SECRET_KEY || "join")
    .update(phone)
    .digest("hex")
    .slice(0, 24);

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return refuse("origin", 403);
  if (Number(req.headers.get("content-length") ?? 0) > 20_000) return refuse("too_big", 413);

  let body: JoinBody;
  try {
    body = (await req.json()) as JoinBody;
  } catch {
    return refuse("bad_request", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return refuse("bad_request", 400);

  const ip = clientIpFrom(req.headers);

  // 1. Cheap bot signals. A filled honeypot gets the normal success reply so bots learn nothing, but nothing is saved.
  if (honeypotFilled(body)) return json({ ok: true });
  if (submittedTooFast(body)) {
    // Log a number only. The raw value comes from the request and is never written to the log.
    const ms = typeof body.elapsedMs === "number" && Number.isFinite(body.elapsedMs) ? Math.round(body.elapsedMs) : "invalid";
    return refuse("too_fast", 400, `elapsedMs=${ms}`);
  }

  // 2. Cloudflare human check. Fails closed.
  const human = await verifyTurnstile(body.turnstileToken, ip);
  if (!human.ok) return refuse("captcha", 400, `reason=${human.reason}`, JOIN_MESSAGES.captcha);

  // 3. Rate limit by visitor (fails open if Redis is unreachable; the human check still stands).
  try {
    const byIp = await joinIpRatelimit.limit(ip ?? "anonymous");
    if (!byIp.success) return refuse("rate_limit", 429, "ip", JOIN_MESSAGES.tooMany);
  } catch (err) {
    console.warn("[Join] IP rate limit check failed, failing open:", (err as Error).message);
  }

  // 4. Validate everything again on the server. Nothing from the browser is trusted.
  const result = validateJoin(body);
  if (!result.ok) return json({ ok: false, error: result.error, field: result.field, code: "invalid" }, 400);
  const family = result.value;

  // 5. Per-number limit. Over the limit looks like success: we already have this family.
  try {
    const byPhone = await joinPhoneRatelimit.limit(phoneKey(family.phone));
    if (!byPhone.success) return json({ ok: true });
  } catch (err) {
    console.warn("[Join] Phone rate limit check failed, failing open:", (err as Error).message);
  }

  // 6. Save to the private board.
  try {
    const { id, callDue } = await createFamilyRow(family);
    console.log(`[Join] created item ${id} source=${family.source}`);

    // 7. Staff alert. The family is already saved, so a failed email must never turn this into an error.
    try {
      await sendFamilySignupNotification({
        parentName: family.name,
        phone: family.phone,
        whatsapp: family.whatsapp,
        source: family.source,
        callDue,
        itemUrl: FAMILY_BOARD.itemUrl(id),
      });
    } catch (err) {
      console.error(`[Join] staff alert failed for item ${id}:`, (err as Error).message);
    }
    return json({ ok: true });
  } catch (err) {
    console.error(`[Join] save failed: ${(err as Error).message}`);
    return json({ ok: false, error: JOIN_MESSAGES.generic, code: "save_failed" }, 500);
  }
}
