"use server";

// ── Column IDs ────────────────────────────────────────────────────────────────
// Events board (5093847317)
const EV_DATE = "date_mm1wd7t7";
const EV_TIME = "text_mm1w8xz4";
const EV_VENUE = "text_mm1wyakt";
const EV_DESC = "long_text_mm1wy4sw";
const EV_CAT = "text_mm1wwj16";
const EV_RSVP_OPEN = "boolean_mm1w165m";

// RSVPs board (5093847318)
const RSVP_EVENT = "text_mm1w3qj8";
const RSVP_EMAIL = "text_mm1w5h3p";
const RSVP_PHONE = "text_mm1w8jqd";
const RSVP_COUNT = "numeric_mm1wbab2";
const RSVP_ORG = "text_mm1w72dj";

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
  const token = process.env.MONDAY_API_TOKEN!;
  const boardId = process.env.MONDAY_EVENTS_BOARD_ID!;

  const query = `{
    boards(ids: [${boardId}]) {
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
  const items = json.data?.boards?.[0]?.items_page?.items ?? [];

  return items.map((item: Record<string, unknown>) => {
    const cols = item.column_values as Array<{ id: string; text: string; value: string }>;
    const col = (id: string) => cols.find((c) => c.id === id);

    const rawDate = col(EV_DATE)?.text ?? "";
    const rsvpValue = col(EV_RSVP_OPEN)?.value;
    const rsvpOpen = rsvpValue ? JSON.parse(rsvpValue)?.checked === true : false;

    return {
      id: item.id as string,
      name: item.name as string,
      date: rawDate,
      time: col(EV_TIME)?.text ?? "",
      venue: col(EV_VENUE)?.text ?? "",
      description: col(EV_DESC)?.text ?? "",
      category: col(EV_CAT)?.text ?? "Community",
      rsvpOpen,
    };
  });
}

export interface RsvpInput {
  eventId: string;
  eventName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  attendees: number;
  organisation: string;
}

export async function submitRsvp(
  input: RsvpInput
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.MONDAY_API_TOKEN!;
  const rsvpBoardId = process.env.MONDAY_RSVP_BOARD_ID!;

  const colValues = JSON.stringify({
    [RSVP_EVENT]: input.eventName,
    [RSVP_EMAIL]: input.email,
    [RSVP_PHONE]: input.phone,
    [RSVP_COUNT]: input.attendees,
    [RSVP_ORG]: input.organisation,
  });

  const mutation = `
    mutation {
      create_item(
        board_id: ${rsvpBoardId},
        item_name: ${JSON.stringify(`${input.firstName} ${input.lastName} — ${input.eventName}`)},
        column_values: ${JSON.stringify(colValues)}
      ) { id }
    }
  `;

  try {
    const mondayRes = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
        "API-Version": "2024-01",
      },
      body: JSON.stringify({ query: mutation }),
    });
    const mondayJson = await mondayRes.json();
    if (mondayJson.errors?.length) throw new Error(mondayJson.errors[0].message);

    console.log(`[RSVP] Created item for ${input.firstName} ${input.lastName} — ${input.eventName}`);

    // SMS notification
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const from = process.env.TWILIO_FROM_NUMBER!;
    const to = process.env.TWILIO_NOTIFY_NUMBER!;

    const smsBody =
      `New RSVP: ${input.firstName} ${input.lastName}\n` +
      `Event: ${input.eventName}\n` +
      `Attendees: ${input.attendees}\n` +
      `Email: ${input.email}\n` +
      `Phone: ${input.phone || "not provided"}`;

    const params = new URLSearchParams({ From: from, To: to, Body: smsBody });
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      },
      body: params.toString(),
    });

    return { success: true };
  } catch (error) {
    console.error("[RSVP] Error:", error);
    return { success: false, error: "Something went wrong. Please try again or contact us." };
  }
}
