"use server";

import crypto from "crypto";

interface DonateInput {
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  isRecurring: boolean;
}

function buildSignature(params: Record<string, string>): string {
  const queryString = Object.keys(params)
    .filter((k) => params[k] !== "")
    .sort()
    .map((k) => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`)
    .join("&");

  return crypto.createHash("md5").update(queryString).digest("hex");
}

export async function buildPayFastPayload(input: DonateInput): Promise<{
  url: string;
  fields: Record<string, string>;
}> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const merchantId = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID!;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY!;
  const amountStr = input.amount.toFixed(2);

  const params: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: `${siteUrl}/donate/thank-you`,
    cancel_url: `${siteUrl}/donate`,
    notify_url: `${siteUrl}/api/payfast/notify`,
    name_first: input.firstName,
    name_last: input.lastName,
    email_address: input.email,
    amount: amountStr,
    item_name: "Donation – Tshiamiso Astronauts NPC",
    item_description: "Supporting literacy and education in Evaton West, Gauteng",
  };

  if (input.isRecurring) {
    // Monthly subscription
    const today = new Date();
    const billingDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    params.subscription_type = "1";
    params.billing_date = billingDate;
    params.recurring_amount = amountStr;
    params.frequency = "3"; // monthly
    params.cycles = "0"; // indefinite
  }

  params.signature = buildSignature(params);

  return {
    url: "https://www.payfast.co.za/eng/process",
    fields: params,
  };
}
