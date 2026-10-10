import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Kill switch for the blog pop-up. Set SUBSCRIBE_POPUP_ENABLED=false in Vercel (then redeploy the
// same commit) to turn it off. Anything else, including unset, means on.
export async function GET() {
  return NextResponse.json(
    { enabled: process.env.SUBSCRIBE_POPUP_ENABLED !== "false" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
