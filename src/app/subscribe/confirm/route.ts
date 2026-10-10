import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_TTL_MS } from "@/config/subscribe";
import type { ConfirmPayload } from "@/lib/subscribe/confirm";
import { CONFIRM_COOKIE, CONFIRM_COOKIE_PATH, cookieOptions } from "@/lib/subscribe/cookies";
import { siteUrl } from "@/lib/subscribe/siteUrl";
import { openToken } from "@/lib/subscribe/token";

export const dynamic = "force-dynamic";

// The link in the confirmation email lands here. This answers with a redirect and no page, so no
// analytics or advertising tag runs on a address that contains the token. The token moves into a
// short-lived HttpOnly cookie, and the visitor continues on /subscribe/confirm/ready, whose address has
// no token in it. Opening the link saves nothing: only the button on that page does.
export async function GET(req: NextRequest) {
  const base = siteUrl();
  const t = req.nextUrl.searchParams.get("t");
  if (!t || t.length > 4096) return NextResponse.redirect(`${base}/subscribe/expired`, 303);

  const opened = openToken<ConfirmPayload>(t, "confirm", TOKEN_TTL_MS);
  if (!opened.ok) return NextResponse.redirect(`${base}/subscribe/expired`, 303);

  const res = NextResponse.redirect(`${base}/subscribe/confirm/ready`, 303);
  res.cookies.set(CONFIRM_COOKIE, t, cookieOptions(CONFIRM_COOKIE_PATH, 30 * 60));
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}
