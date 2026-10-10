import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_TTL_MS } from "@/config/subscribe";
import type { ConfirmPayload } from "@/lib/subscribe/confirm";
import { CONFIRM_COOKIE, CONFIRM_COOKIE_PATH, cookieOptions } from "@/lib/subscribe/cookies";
import { openToken } from "@/lib/subscribe/token";

export const dynamic = "force-dynamic";

// The link in the confirmation email lands here. This answers with a redirect and no page, so no
// analytics or advertising tag runs on a address that contains the token. The token moves into a
// short-lived HttpOnly cookie, and the visitor continues on /subscribe/confirm/ready, whose address has
// no token in it. Opening the link saves nothing: only the button on that page does.
export async function GET(req: NextRequest) {
  // Redirect on the address the visitor is already on, so they never switch host and lose the cookie.
  const to = (path: string) => {
    const u = req.nextUrl.clone();
    u.pathname = path;
    u.search = "";
    return u;
  };
  const t = req.nextUrl.searchParams.get("t");
  if (!t || t.length > 4096) return NextResponse.redirect(to("/subscribe/expired"), 303);

  const opened = openToken<ConfirmPayload>(t, "confirm", TOKEN_TTL_MS);
  if (!opened.ok) return NextResponse.redirect(to("/subscribe/expired"), 303);

  const res = NextResponse.redirect(to("/subscribe/confirm/ready"), 303);
  res.cookies.set(CONFIRM_COOKIE, t, cookieOptions(CONFIRM_COOKIE_PATH, 30 * 60));
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}
