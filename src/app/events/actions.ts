"use server";

import { headers } from "next/headers";
import { clientIpFrom } from "@/lib/clientIp";
import { verifyTurnstile } from "@/lib/subscribe/turnstile";
import { formRatelimit } from "@/lib/ratelimit";
import { isValidPhone, PHONE_ERROR } from "@/lib/events/phone";

// ── Column IDs ────────────────────────────────────────────────────────────────
// Events board (5093847317)
const EV_DATE     = "date_mm1wd7t7";
const EV_TIME     = "text_mm1w8xz4";
const EV_VENUE    = "text_mm1wyakt";
const EV_DESC     = "long_text_mm1wy4sw";
const EV_CAT      = "text_mm1wwj16";
const EV_RSVP_OPEN = "boolean_mm1w165m";

// RSVPs board (5093847318)
const RSVP_EVENT = "text_mm1w3qj8";
const RSVP_EMAIL = "text_mm1w5h3p";
const RSVP_PHONE = "text_mm1w8jqd";
const RSVP_COUNT = "numeric_mm1wbab2";
const RSVP_ORG   = "text_mm1w72dj";

export interface MondayEvent {
  id: string;
  name: string;
  date: string;       // "YYYY-MM-DD"
  time: string;
  venue: string;
  description: string;
  category: string;   // "Spelling Bee" | "Community" | "Fundraising"
  rsvpOpen: boolean;
}

export async function fetchEvents(): Promise<MondayEvent[]> {
  const token   = process.env.MONDAY_API_TOKEN;
  const boardId = process.env.MONDAY_EVENTS_BOARD_ID;

  if (!token || !boardId) {
    console.error("[Events] Missing MONDAY_API_TOKEN or MONDAY_EVENTS_BOARD_ID");
    return [];
  }

  const query = `{
    boards(ids: [${Number(boardId)}]) {
      items_page(limit: 50) {
        items {
          id
          name
          column_values(ids: ["${EV_DATE}", "${EV_TIME}", "${EV_VENUE}", "${EV_DESC}", "${EV_CAT}", "${EV_RSVP_OPEN}"]) {
            id
            text
            value
          }
        }
      }
    }
  }`;

  const res = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
      "API-Version": "2024-01",
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  const json = await res.json();
  const items: unknown[] = json.data?.boards?.[0]?.items_page?.items ?? [];

  if (!Array.isArray(items)) return [];

  return items.map((item) => {
    const record = item as Record<string, unknown>;
    const cols = Array.isArray(record.column_values)
      ? (record.column_values as Array<{ id: string; text: string; value: string }>)
      : [];
    const col = (id: string) => cols.find((c) => c.id === id);

    const rsvpValue = col(EV_RSVP_OPEN)?.value;
    const rsvpOpen  = rsvpValue ? JSON.parse(rsvpValue)?.checked === true : false;

    return {
      id:          String(record.id ?? ""),
      name:        String(record.name ?? ""),
      date:        col(EV_DATE)?.text ?? "",
      time:        col(EV_TIME)?.text ?? "",
      venue:       col(EV_VENUE)?.text ?? "",
      description: col(EV_DESC)?.text ?? "",
      category:    col(EV_CAT)?.text ?? "Community",
      rsvpOpen,
    };
  });
}

export interface RsvpInput {
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organisation: string;
  consent: boolean;
  turnstileToken?: string;
}

// ── Server-side event verification ───────────────────────────────────────────
// Returns the canonical event name and RSVP-open flag from Monday.com in a
// single query — the client-supplied event name is never trusted.
async function fetchEventDetails(
  eventId: string,
  token: string
): Promise<{ open: boolean; name: string } | null> {
  const numId = Number(eventId);
  if (!Number.isInteger(numId) || numId <= 0) return null;

  const query = `{
    items(ids: [${numId}]) {
      name
      column_values(ids: ["${EV_RSVP_OPEN}"]) { value }
    }
  }`;

  try {
    const res = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "API-Version": "2024-01",
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });
    const json = await res.json();
    const item = json.data?.items?.[0];
    if (!item) return null;
    const value = item.column_values?.[0]?.value;
    const open  = value ? JSON.parse(value)?.checked === true : false;
    return { open, name: String(item.name ?? "") };
  } catch {
    return null;
  }
}

// ── Duplicate check ───────────────────────────────────────────────────────────
// One RSVP per person per event. Looks for an existing row on the RSVPs board with the same email and the
// same event name. Returns null if the lookup itself fails, so the caller can decide (we let the RSVP through:
// the create call that follows would fail too if Monday.com is really down).
async function hasExistingRsvp(
  token: string,
  boardId: string,
  eventName: string,
  email: string
): Promise<boolean | null> {
  const query = `
    query FindRsvp($boardId: ID!, $columns: [ItemsPageByColumnValuesQuery!]!) {
      items_page_by_column_values(board_id: $boardId, columns: $columns, limit: 5) {
        items { id column_values(ids: ["${RSVP_EVENT}", "${RSVP_EMAIL}"]) { id text } }
      }
    }
  `;
  const variables = {
    boardId,
    columns: [
      { column_id: RSVP_EMAIL, column_values: [email] },
      { column_id: RSVP_EVENT, column_values: [eventName] },
    ],
  };

  try {
    const res = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "API-Version": "2024-01",
      },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors[0].message);
    const items: Array<{ column_values?: Array<{ id: string; text: string | null }> }> =
      json.data?.items_page_by_column_values?.items ?? [];
    // Double-check the match ourselves (case-insensitive) rather than trusting the filter alone.
    return items.some((item) => {
      const text = (colId: string) => (item.column_values?.find((c) => c.id === colId)?.text ?? "").trim().toLowerCase();
      return text(RSVP_EMAIL) === email && text(RSVP_EVENT) === eventName.trim().toLowerCase();
    });
  } catch (error) {
    console.warn("[RSVP] Duplicate check failed:", error);
    return null;
  }
}

// ── Server-side validation ─────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(input: RsvpInput): string | null {
  if (!input.firstName?.trim() || input.firstName.length > 100) return "First name is required.";
  if (!input.lastName?.trim() || input.lastName.length > 100)   return "Last name is required.";
  if (!input.email?.trim() || !EMAIL_RE.test(input.email) || input.email.length > 254) return "A valid email address is required.";
  const phone = input.phone?.trim() ?? "";
  if (!phone) return "A phone number is required so we can reach you about the event.";
  if (!isValidPhone(phone)) return PHONE_ERROR;
  if (input.organisation && input.organisation.length > 200) return "Organisation name is too long.";
  if (input.consent !== true) return "Please tick the box so we know you agree.";
  return null;
}

// Strip newlines/tabs to prevent SMS header injection
function sanitizeSms(value: string, maxLen = 80): string {
  return value.replace(/[\r\n\t]/g, " ").trim().slice(0, maxLen);
}

export async function submitRsvp(
  input: RsvpInput
): Promise<{ success: boolean; error?: string }> {
  const headersList = await headers();
  const ip = clientIpFrom(headersList) ?? "anonymous";
  const { success: allowed } = await formRatelimit.limit(ip);
  if (!allowed) return { success: false, error: "Too many requests. Please try again later." };

  const human = await verifyTurnstile(input.turnstileToken, ip);
  if (!human.ok) {
    console.warn(`[RSVP] refused: captcha ${human.reason}`);
    return { success: false, error: "We couldn't confirm you're human. Please refresh the page and try again." };
  }

  const token       = process.env.MONDAY_API_TOKEN;
  const rsvpBoardId = process.env.MONDAY_RSVP_BOARD_ID;

  if (!token || !rsvpBoardId) {
    console.error("[RSVP] Missing MONDAY_API_TOKEN or MONDAY_RSVP_BOARD_ID");
    return { success: false, error: "Server configuration error. Please contact us directly." };
  }

  const validationError = validate(input);
  if (validationError) return { success: false, error: validationError };

  const details = await fetchEventDetails(input.eventId, token);
  if (!details || !details.open) {
    return { success: false, error: "RSVP is no longer available for this event." };
  }

  const eventName = details.name; // authoritative server-side name
  const email     = input.email.trim().toLowerCase();

  if (await hasExistingRsvp(token, rsvpBoardId, eventName, email)) {
    return {
      success: false,
      error: "This email address has already RSVP'd for this event. If you need to change your details, please contact us.",
    };
  }

  // One person per RSVP: everyone attending must submit their own form, so the count is always 1.
  const attendees = 1;
  const fullName  = `${input.firstName.trim()} ${input.lastName.trim()}`;
  const itemName  = `${fullName} — ${eventName}`;

  // Use GraphQL variables — no user data in the query string
  const mutation = `
    mutation CreateRsvp($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item(
        board_id: $boardId,
        item_name: $itemName,
        column_values: $columnValues
      ) { id }
    }
  `;

  const variables = {
    boardId: rsvpBoardId,
    itemName,
    columnValues: JSON.stringify({
      [RSVP_EVENT]: eventName,
      [RSVP_EMAIL]: email,
      [RSVP_PHONE]: input.phone.trim(),
      [RSVP_COUNT]: attendees,
      [RSVP_ORG]:   input.organisation.trim(),
    }),
  };

  try {
    const mondayRes = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "API-Version": "2024-01",
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const mondayJson = await mondayRes.json();
    if (mondayJson.errors?.length) throw new Error(mondayJson.errors[0].message);

    console.log(`[RSVP] Created item ${mondayJson.data?.create_item?.id}`);

    // SMS notification — fire and forget, never block the RSVP success
    sendRsvpSms(input, eventName, fullName).catch((err) =>
      console.warn("[RSVP] SMS notification failed:", err)
    );

    return { success: true };
  } catch (error) {
    console.error("[RSVP] Error:", error);
    return { success: false, error: "Something went wrong. Please try again or contact us." };
  }
}

async function sendRsvpSms(input: RsvpInput, eventName: string, fullName: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_FROM_NUMBER;
  const to         = process.env.TWILIO_NOTIFY_NUMBER;

  if (!accountSid || !authToken || !from || !to) {
    console.warn("[RSVP] Twilio env vars missing — skipping SMS");
    return;
  }

  // Sanitize all user fields before embedding in SMS body
  const name           = sanitizeSms(fullName, 80);
  const safeEventName  = sanitizeSms(eventName, 80);
  const email     = sanitizeSms(input.email, 100);
  const phone     = sanitizeSms(input.phone || "not provided", 20);

  const smsBody =
    `New RSVP: ${name}\n` +
    `Event: ${safeEventName}\n` +
    `Email: ${email}\n` +
    `Phone: ${phone}`;

  const params = new URLSearchParams({ From: from, To: to, Body: smsBody });

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
    const err = await res.json().catch(() => ({}));
    console.warn("[RSVP] Twilio error:", err);
    return;
  }

  const json = await res.json();
  console.log(`[RSVP] SMS sent via Twilio SID ${json.sid}`);
}
