import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_TTL_MS } from "@/config/subscribe";
import { completeSignup, type ConfirmPayload } from "@/lib/subscribe/confirm";
import { siteUrl } from "@/lib/subscribe/siteUrl";
import { openToken, sealToken } from "@/lib/subscribe/token";

export const dynamic = "force-dynamic";

// A person pressed "Confirm my subscription". The encrypted token is the credential, so no other
// check is needed. Idempotent: a second press finds the contact and row already there, updates them
// quietly and sends no second welcome email.
export async function POST(req: NextRequest) {
  const base = siteUrl();
  const expired = () => NextResponse.redirect(`${base}/subscribe/expired`, 303);

  let t: FormDataEntryValue | null = null;
  try {
    t = (await req.formData()).get("t");
  } catch {
    return expired();
  }
  if (typeof t !== "string" || t.length === 0 || t.length > 4096) return expired();

  const opened = openToken<ConfirmPayload>(t, "confirm", TOKEN_TTL_MS);
  if (!opened.ok) return expired();

  const { alreadySubscribed } = await completeSignup(opened.data, opened.issuedAt);

  // The first name travels to the thank-you page encrypted and short-lived, never in the clear.
  const c = sealToken("confirmed", { n: opened.data.firstName, a: alreadySubscribed });
  const res = NextResponse.redirect(`${base}/subscribe/confirmed?c=${c}`, 303);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}
