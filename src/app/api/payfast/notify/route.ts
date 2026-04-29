import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { payfastRatelimit } from "@/lib/ratelimit";
import { sendDonorReceipt, sendDonorNotification } from "@/lib/resend";

// PayFast published ITN source IPs.
// Verify these are current at: https://developers.payfast.co.za/docs#step_5_itn
const PAYFAST_VALID_IPS = new Set([
  "197.97.145.144",
  "197.97.145.145",
  "197.97.145.146",
  "197.97.145.147",
  "197.97.145.148",
  "197.97.145.149",
  "197.97.145.150",
  "197.97.145.151",
  "41.74.179.194",
  "41.74.179.195",
  "41.74.179.196",
  "41.74.179.197",
  "41.74.179.198",
  "41.74.179.199",
  "41.74.179.200",
  "41.74.179.201",
]);

/**
 * Verify the PayFast ITN signature.
 *
 * Algorithm (from PayFast docs):
 *   1. Take all posted fields except "signature", drop empty values.
 *   2. Build a URL-encoded query string preserving the received field order.
 *   3. If PAYFAST_PASSPHRASE is configured, append &passphrase=<value>.
 *   4. MD5-hash the string and compare to the posted "signature" field.
 */
function verifySignature(
  params: Record<string, string>,
  receivedSig: string,
  passphrase: string | undefined
): boolean {
  const pairs = Object.entries(params)
    .filter(([key, val]) => key !== "signature" && val !== "")
    .map(([key, val]) => `${key}=${encodeURIComponent(val).replace(/%20/g, "+")}`);

  const queryString = pairs.join("&");
  const stringToHash = passphrase
    ? `${queryString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : queryString;

  const computed = crypto.createHash("md5").update(stringToHash).digest("hex");

  // Timing-safe comparison prevents timing-oracle attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "utf8"),
      Buffer.from(receivedSig, "utf8")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Rate limit ───────────────────────────────────────────────────────
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const sourceIp = (forwardedFor ? forwardedFor.split(",")[0] : realIp ?? "").trim();

    const { success: allowed } = await payfastRatelimit.limit(sourceIp || "anonymous");
    if (!allowed) {
      console.warn(`[PayFast ITN] Rate limited: ${sourceIp}`);
      return new NextResponse("Too Many Requests", { status: 429 });
    }

    // ── 2. Verify source IP ─────────────────────────────────────────────────
    const isLocalDev = process.env.NODE_ENV !== "production";
    const ipAllowed = isLocalDev || PAYFAST_VALID_IPS.has(sourceIp);

    if (!ipAllowed) {
      console.warn(`[PayFast ITN] Rejected: unexpected source IP ${sourceIp}`);
      return new NextResponse("Forbidden", { status: 403 });
    }

    // ── 3. Parse body — preserve field order for signature verification ─────
    const body = await req.formData();
    const params: Record<string, string> = {};
    body.forEach((value, key) => {
      params[key] = String(value);
    });

    const receivedSig = params["signature"] ?? "";

    // ── 4. Verify signature ─────────────────────────────────────────────────
    const passphrase = process.env.PAYFAST_PASSPHRASE || undefined;

    if (!verifySignature(params, receivedSig, passphrase)) {
      console.warn("[PayFast ITN] Rejected: invalid signature");
      return new NextResponse("Bad Request", { status: 400 });
    }

    // ── 5. Process verified notification ───────────────────────────────────
    const paymentStatus = params["payment_status"];
    const amount        = params["amount_gross"];

    // Log without full PII — only email domain, not the full address (POPIA)
    const emailParts = (params["email_address"] ?? "").split("@");
    const safeEmail  = emailParts.length === 2 ? `***@${emailParts[1]}` : "***";

    console.log(
      `[PayFast ITN] Status: ${paymentStatus} | Amount: R${amount} | Email: ${safeEmail}`
    );

    if (paymentStatus === "COMPLETE") {
      const donorEmail = params["email_address"];
      const firstName = params["name_first"] || "Donor";
      const lastName = params["name_last"] || "";

      await Promise.all([
        sendDonorReceipt(donorEmail, firstName, amount),
        sendDonorNotification(firstName, lastName, donorEmail, amount)
      ]).catch(err => console.error("[PayFast ITN] Email notification failed:", err));
    }

    // Always return 200 to acknowledge receipt — PayFast retries on non-200
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[PayFast ITN] Error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
