// Cloudflare Turnstile server check. Fails closed: no secret or no token means "not human".
// Local development can use Cloudflare's published always-pass test keys.
// The reason is for server logs only (it never contains the visitor's details).
export type TurnstileResult = { ok: true } | { ok: false; reason: string };

export async function verifyTurnstile(token: unknown, ip: string | null): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: false, reason: "no_secret_configured" };
  if (typeof token !== "string" || token.length === 0) return { ok: false, reason: "no_token_from_browser" };
  if (token.length > 2048) return { ok: false, reason: "token_too_long" };
  try {
    const form = new URLSearchParams({ secret, response: token });
    if (ip) form.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
      cache: "no-store",
    });
    if (!res.ok) return { ok: false, reason: `siteverify_http_${res.status}` };
    const json = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (json.success === true) return { ok: true };
    return { ok: false, reason: `rejected:${(json["error-codes"] ?? []).join(",") || "unknown"}` };
  } catch {
    return { ok: false, reason: "siteverify_unreachable" };
  }
}
