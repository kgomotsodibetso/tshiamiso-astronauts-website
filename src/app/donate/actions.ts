"use server";

import crypto from "crypto";

interface DonateInput {
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  isRecurring: boolean;
}

function buildSignature(params: Record<string, string>, passphrase?: string): string {
  const queryString = Object.keys(params)
    .filter((k) => params[k] !== "")
    .sort()
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`)
    .join("&");

  const stringToHash = passphrase
    ? `${queryString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : queryString;

  return crypto.createHash("md5").update(stringToHash).digest("hex");
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
