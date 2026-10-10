import { NextResponse } from "next/server";
import { CONSENT_DEFAULT_DENIED_REGIONS } from "@/config/consent";

// Tells the cookie code whether the visitor is in the EEA or UK (opt-in) or anywhere else.
// The country comes from Cloudflare's CF-IPCountry header, which Cloudflare adds in front of the site.
// Nothing is stored and no personal data is kept. If the country is missing or unknown
// (no header, "XX" unknown, "T1" Tor), we treat the visitor as being in the opt-in group.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const country = request.headers.get("cf-ipcountry")?.trim().toUpperCase() ?? "";
  const known = /^[A-Z]{2}$/.test(country) && country !== "XX" && country !== "T1";
  const optIn = !known || (CONSENT_DEFAULT_DENIED_REGIONS as readonly string[]).includes(country);
  return NextResponse.json({ optIn }, { headers: { "Cache-Control": "private, no-store" } });
}
