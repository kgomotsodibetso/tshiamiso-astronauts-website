"use server";

import crypto from "crypto";

interface DonateInput {
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  isRecurring: boolean;
}

// PayFast requires fields in this exact order for signature generation.
// Source: PayFast PHP SDK Auth.php — do NOT sort alphabetically.
const PAYFAST_FIELD_ORDER = [
  "merchant_id", "merchant_key", "return_url", "cancel_url", "notify_url",
  "notify_method", "name_first", "name_last", "email_address", "cell_number",
  "m_payment_id", "amount", "item_name", "item_description",
  "custom_int1", "custom_int2", "custom_int3", "custom_int4", "custom_int5",
  "custom_str1", "custom_str2", "custom_str3", "custom_str4", "custom_str5",
  "email_confirmation", "confirmation_address", "currency", "payment_method",
  "subscription_type",
  // passphrase is inserted here when present
  "billing_date", "recurring_amount", "frequency", "cycles",
  "subscription_notify_email", "subscription_notify_webhook", "subscription_notify_buyer",
];

function buildSignature(params: Record<string, string>, passphrase?: string): string {
  // Build ordered entries following PayFast's exact field order
  const entries: [string, string][] = [];

  for (const key of PAYFAST_FIELD_ORDER) {
    if (key === "subscription_type" && params[key]) {
      entries.push([key, params[key]]);
      // Passphrase is inserted immediately after subscription_type
      if (passphrase?.trim()) {
        entries.push(["passphrase", passphrase.trim()]);
      }
      continue;
    }
    if (params[key] !== undefined && params[key] !== "") {
      entries.push([key, params[key]]);
    }
    // If we've exhausted all known fields and passphrase hasn't been added yet
    // (non-subscription case), it goes after payment_method / at end of known fields
  }

  // Non-subscription: passphrase goes after all other fields
  if (passphrase?.trim() && !params["subscription_type"]) {
    entries.push(["passphrase", passphrase.trim()]);
  }

  const paramString = entries
    .map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%20/g, "+")}`)
    .join("&");

  return crypto.createHash("md5").update(paramString).digest("hex");
}

export async function buildPayFastPayload(input: DonateInput): Promise<{
  url: string;
  fields: Record<string, string>;
}> {
  // Server-side validation — reject malformed input before building the payment request
  const firstName = input.firstName.trim();
  const lastName  = input.lastName.trim();
  const email     = input.email.trim();

  if (!firstName || firstName.length > 100) throw new Error("Invalid first name.");
  if (!lastName  || lastName.length  > 100) throw new Error("Invalid last name.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email address.");
  if (!Number.isFinite(input.amount) || input.amount < 10 || input.amount > 100_000) {
    throw new Error("Amount must be between R10 and R100,000.");
  }

  const siteUrl     = process.env.NEXT_PUBLIC_SITE_URL!;
  const merchantId  = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID!;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY!;
  const amountStr   = input.amount.toFixed(2);

  const params: Record<string, string> = {
    merchant_id:      merchantId,
    merchant_key:     merchantKey,
    return_url:       `${siteUrl}/donate/thank-you`,
    cancel_url:       `${siteUrl}/donate`,
    notify_url:       `${siteUrl}/api/payfast/notify`,
    name_first:       firstName,
    name_last:        lastName,
    email_address:    email,
    amount:           amountStr,
    item_name:        "Donation – Tshiamiso Astronauts NPC",
    item_description: "Supporting literacy and education in Evaton West, Gauteng",
  };

  if (input.isRecurring) {
    // Monthly subscription
    const today = new Date();
    const billingDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    params.subscription_type = "1";
    params.billing_date      = billingDate;
    params.recurring_amount  = amountStr;
    params.frequency         = "3"; // monthly
    params.cycles            = "0"; // indefinite
  }

  const passphrase = process.env.PAYFAST_PASSPHRASE || undefined;
  params.signature = buildSignature(params, passphrase);

  return {
    url: "https://www.payfast.co.za/eng/process",
    fields: params,
  };
}
