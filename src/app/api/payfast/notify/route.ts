import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { clientIpFrom } from "@/lib/clientIp";
import { payfastRatelimit } from "@/lib/ratelimit";
import { sendDonorReceipt, sendDonorNotification, type CertificateEmail } from "@/lib/resend";
import { buildCertificatePdf } from "@/lib/certificate";
import { alreadySent, markSent, receiptNumberFor, receiptStore } from "@/lib/receipts";

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

// PayFast's own server confirms the notification is genuine (guards against a forged request).
async function payfastConfirms(params: Record<string, string>): Promise<boolean> {
  const body = Object.entries(params)
    .filter(([key]) => key !== "signature")
    .map(([key, val]) => `${key}=${encodeURIComponent(val).replace(/%20/g, "+")}`)
    .join("&");
  const res = await fetch("https://www.payfast.co.za/eng/query/validate", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  return res.ok && (await res.text()).trim() === "VALID";
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Rate limit ───────────────────────────────────────────────────────
    // Behind Cloudflare, x-forwarded-for starts with a Cloudflare edge address, not PayFast's.
    // The real sender is in cf-connecting-ip.
    const sourceIp = clientIpFrom(req.headers) ?? "";

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
      // The payment must be to our own PayFast account, for a real amount.
      const merchantId = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID;
      if (!merchantId || params["merchant_id"] !== merchantId) {
        console.warn("[PayFast ITN] Rejected: merchant_id mismatch");
        return new NextResponse("Bad Request", { status: 400 });
      }
      if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        console.warn("[PayFast ITN] Rejected: invalid amount");
        return new NextResponse("Bad Request", { status: 400 });
      }

      // Only in production: PayFast's own check that this notification is real. If PayFast can't be
      // reached we answer 500 so it retries later; nothing is issued until it says VALID.
      if (process.env.NODE_ENV === "production") {
        let valid = false;
        try {
          valid = await payfastConfirms(params);
        } catch (err) {
          console.error("[PayFast ITN] Could not reach PayFast to confirm:", err);
          return new NextResponse("Try again", { status: 500 });
        }
        if (!valid) {
          console.warn("[PayFast ITN] Rejected: PayFast did not confirm this notification");
          return new NextResponse("Bad Request", { status: 400 });
        }
      }

      const donorEmail = params["email_address"];
      const firstName = params["name_first"] || "Donor";
      const lastName = params["name_last"] || "";
      const paymentId = params["pf_payment_id"] || params["m_payment_id"] || "";
      const store = receiptStore();

      // A repeated notification for a payment we already handled sends nothing a second time.
      if (store && paymentId && (await alreadySent(store, paymentId))) {
        console.log(`[PayFast ITN] Already handled payment ${paymentId}`);
        return new NextResponse("OK", { status: 200 });
      }

      // Section 18A certificate: numbered in sequence, built as a PDF and attached to both emails.
      // If it cannot be made, the thank-you still goes out and the admin email says to issue one by hand.
      let cert: CertificateEmail | undefined;
      if (store && paymentId) {
        try {
          const now = new Date();
          const year = Number(new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric" }).format(now));
          const receiptNumber = await receiptNumberFor(store, paymentId, year);
          const pdf = await buildCertificatePdf({
            receiptNumber,
            donorName: `${firstName} ${lastName}`.trim(),
            donorEmail,
            amount: Number(amount).toFixed(2),
            date: now,
            recurring: !!params["token"],
          });
          cert = { receiptNumber, pdf };
        } catch (err) {
          console.error("[PayFast ITN] Could not issue 18A certificate:", err);
        }
      } else {
        console.warn("[PayFast ITN] Receipt store (Upstash) not configured; no 18A certificate issued");
      }

      const results = await Promise.all([
        sendDonorReceipt(donorEmail, firstName, amount, cert),
        sendDonorNotification(firstName, lastName, donorEmail, amount, cert),
      ]);
      const donorSent = !!results[0] && !results[0].error;
      if (donorSent && store && paymentId) await markSent(store, paymentId).catch(() => undefined);
      if (!donorSent) {
        // Let PayFast retry: the receipt number is already saved for this payment, so the retry reuses it.
        console.error("[PayFast ITN] Donor email failed; asking PayFast to retry");
        return new NextResponse("Try again", { status: 500 });
      }
    }

    // Always return 200 to acknowledge receipt — PayFast retries on non-200
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[PayFast ITN] Error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
