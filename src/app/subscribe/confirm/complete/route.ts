import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_TTL_MS } from "@/config/subscribe";
import { completeSignup, type ConfirmPayload } from "@/lib/subscribe/confirm";
import {
  CONFIRM_COOKIE,
  CONFIRM_COOKIE_PATH,
  CONFIRMED_COOKIE,
  CONFIRMED_COOKIE_PATH,
  cookieOptions,
} from "@/lib/subscribe/cookies";
import { openToken, sealToken } from "@/lib/subscribe/token";

export const dynamic = "force-dynamic";

// A person pressed "Confirm my subscription". The encrypted token (from the HttpOnly cookie set when the
// email link was opened) is the credential. Idempotent: a second press finds the contact and row already
// there, updates them quietly and sends no second welcome email.
export async function POST(req: NextRequest) {
  // Redirect on the address the visitor is already on, so they never switch host and lose the cookie.
  const to = (path: string) => {
    const u = req.nextUrl.clone();
    u.pathname = path;
    u.search = "";
    return u;
  };
  const expired = () => NextResponse.redirect(to("/subscribe/expired"), 303);

  const t = req.cookies.get(CONFIRM_COOKIE)?.value;
  if (!t || t.length > 4096) return expired();

  const opened = openToken<ConfirmPayload>(t, "confirm", TOKEN_TTL_MS);
  if (!opened.ok) return expired();

  const { alreadySubscribed } = await completeSignup(opened.data, opened.issuedAt);

  // The thank-you page needs the first name. It travels in a second short-lived HttpOnly cookie
  // (encrypted), so the thank-you page address has nothing in it either.
  const c = sealToken("confirmed", { n: opened.data.firstName, a: alreadySubscribed });
  const res = NextResponse.redirect(to("/subscribe/confirmed"), 303);
  res.cookies.set(CONFIRMED_COOKIE, c, cookieOptions(CONFIRMED_COOKIE_PATH, 15 * 60));
  res.cookies.set(CONFIRM_COOKIE, "", { ...cookieOptions(CONFIRM_COOKIE_PATH, 0), maxAge: 0 });
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}
