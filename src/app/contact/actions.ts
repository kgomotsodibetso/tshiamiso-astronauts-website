"use server";

export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// ── Server-side validation ─────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_SUBJECTS = [
  "General Enquiry",
  "Volunteering",
  "Donations & Fundraising",
  "Partnerships",
  "Media & Press",
  "Other",
];

function validate(input: ContactInput): string | null {
  if (!input.firstName?.trim() || input.firstName.length > 100) return "First name is required (max 100 chars).";
  if (!input.lastName?.trim() || input.lastName.length > 100) return "Last name is required (max 100 chars).";
  if (!input.email?.trim() || !EMAIL_RE.test(input.email) || input.email.length > 254) return "A valid email address is required.";
  if (input.phone && input.phone.length > 20) return "Phone number is too long.";
  if (!input.subject || !VALID_SUBJECTS.includes(input.subject)) return "Please select a valid subject.";
  if (!input.message?.trim() || input.message.length > 5000) return "Message is required (max 5000 characters).";
  return null;
}

// Strip newlines/tabs to prevent SMS header injection
function sanitizeSms(value: string, maxLen = 80): string {
  return value.replace(/[\r\n\t]/g, " ").trim().slice(0, maxLen);
}

async function saveToMonday(input: ContactInput): Promise<void> {
  const token = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_CONTACT_BOARD_ID;

  if (!token || !boardId) throw new Error("Missing Monday.com configuration");

  const today = new Date().toISOString().split("T")[0];
  const itemName = `${input.firstName.trim()} ${input.lastName.trim()} — ${input.subject}`;

  const mutation = `
    mutation CreateContact($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item(
        board_id: $boardId,
        item_name: $itemName,
        column_values: $columnValues
      ) { id }
    }
  `;

  const variables = {
    boardId,
    itemName,
    columnValues: JSON.stringify({
      text_mm1w50ak: input.email.trim().toLowerCase(),
      text_mm1w6s7n: input.phone.trim(),
      long_text_mm1wg8qm: {
        text: `Subject: ${input.subject}\n\n${input.message}`,
      },
      date_mm1wwsx4: { date: today },
    }),
  };

  const res = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "API-Version": "2024-01",
    },
    body: JSON.stringify({ query: mutation, variables }),
  });

  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);

  console.log(`[Contact] Monday.com item ${json.data?.create_item?.id} created`);
}

async function sendSmsNotification(input: ContactInput): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.TWILIO_NOTIFY_NUMBER;

  if (!accountSid || !authToken || !from || !to) {
    console.warn("[Contact] Twilio env vars missing — skipping SMS");
    return;
  }

  // Sanitize all user fields before embedding in SMS body
  const name    = sanitizeSms(`${input.firstName} ${input.lastName}`, 80);
  const subject = sanitizeSms(input.subject, 60);
  const email   = sanitizeSms(input.email, 100);
  const phone   = sanitizeSms(input.phone || "not provided", 20);
  const message = sanitizeSms(input.message, 100);

  const body =
    `New enquiry from ${name}\n` +
    `Subject: ${subject}\n` +
    `Email: ${email}\n` +
    `Phone: ${phone}\n` +
    `Message: ${message}${input.message.length > 100 ? "…" : ""}`;

  const params = new URLSearchParams({ From: from, To: to, Body: body });

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      },
      body: params.toString(),
    }
  );

  if (!res.ok) {
    // Log but don't throw — SMS is a notification, not critical
    const err = await res.json().catch(() => ({}));
    console.warn("[Contact] Twilio error:", err);
    return;
  }

  const json = await res.json();
  console.log(`[Contact] SMS sent via Twilio SID ${json.sid}`);
}

export async function submitContactForm(
  input: ContactInput
): Promise<{ success: boolean; error?: string }> {
  const validationError = validate(input);
  if (validationError) return { success: false, error: validationError };

  // Save to Monday.com first — this is the authoritative record
  try {
    await saveToMonday(input);
  } catch (error) {
    console.error("[Contact] Monday.com save failed:", error);
    return {
      success: false,
      error: "Something went wrong. Please email us directly at info@tshiamisoastronauts.org",
    };
  }

  // Send SMS notification independently — failure does not affect the user
  sendSmsNotification(input).catch((err) =>
    console.error("[Contact] SMS notification failed:", err)
  );

  return { success: true };
}
