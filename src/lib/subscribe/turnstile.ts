// Cloudflare Turnstile server check. Fails closed: no secret or no token means "not human".
// Local development can use Cloudflare's published always-pass test keys.
// The reason is for server logs only (it never contains the visitor's details).
export type TurnstileResult = { ok: true } | { ok: false; reason: string };

// Hostnames whose tokens the live site accepts. Cloudflare tells us which hostname the visitor solved the
// check on. On production we only trust our own, so a token earned on localhost or a preview address (which the
// widget may also allow) cannot be replayed against the live site. Add more with TURNSTILE_ALLOWED_HOSTNAMES
// (comma separated). Previews and local development are not restricted: the widget's own hostname list and
// Vercel's preview protection already limit who can reach them.
const LIVE_HOSTNAMES = ["tshiamisoastronauts.org", "www.tshiamisoastronauts.org"];

function hostnameAllowed(hostname: unknown): boolean {
  if (process.env.VERCEL_ENV !== "production") return true;
  if (typeof hostname !== "string" || hostname.length === 0) return false;
  const extra = (process.env.TURNSTILE_ALLOWED_HOSTNAMES ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return [...LIVE_HOSTNAMES, ...extra].includes(hostname.toLowerCase());
}

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
    const json = (await res.json()) as { success?: boolean; hostname?: string; "error-codes"?: string[] };
    if (json.success === true) {
      // A hostname is a website address, not a visitor's detail, so it is safe to keep in the reason.
      if (!hostnameAllowed(json.hostname)) return { ok: false, reason: `hostname_not_allowed:${String(json.hostname ?? "none").slice(0, 100)}` };
      return { ok: true };
    }
    return { ok: false, reason: `rejected:${(json["error-codes"] ?? []).join(",") || "unknown"}` };
  } catch {
    return { ok: false, reason: "siteverify_unreachable" };
  }
}
