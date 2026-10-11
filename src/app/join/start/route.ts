import { NextResponse, type NextRequest } from "next/server";
import { getJoinFormConfig, JOIN_PATH } from "@/config/join";
import { cleanSource } from "@/lib/join/source";
import { countJoinClick } from "@/lib/join/count";

export const dynamic = "force-dynamic";

// The "Tell us about your family" button points here (/join/start?s=flyer).
// We clean the source, add one to that source's tally, and send the visitor on to the sign-up form.
export async function GET(req: NextRequest) {
  const source = cleanSource(req.nextUrl.searchParams.get("s"));
  const { formUrl, sourceParam } = getJoinFormConfig();

  const back = new URL(JOIN_PATH, req.nextUrl.origin);
  if (!formUrl) {
    // The form is not switched on yet. Show the page's own "opens soon" message instead.
    return NextResponse.redirect(back, { status: 302, headers: { "Cache-Control": "no-store" } });
  }

  await countJoinClick(source);

  const target = new URL(formUrl);
  if (sourceParam) target.searchParams.set(sourceParam, source);
  return NextResponse.redirect(target, { status: 302, headers: { "Cache-Control": "no-store" } });
}
