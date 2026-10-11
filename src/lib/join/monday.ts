import { FAMILY_BOARD, JOIN_CONSENT_TEXT, JOIN_CONSENT_VERSION } from "@/config/join";
import type { CleanJoin } from "./validate";

// Writes one row on the private family-interest board. Never reads, changes or deletes anything else.
// The board is shared with the monday WorkForm, so the same column ids and labels are used.

const sastParts = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(d)
    .replace(",", ""); // "YYYY-MM-DD HH:mm"

export async function createFamilyRow(f: CleanJoin): Promise<{ id: string; callDue: string }> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) throw new Error("MONDAY_API_TOKEN is not set");

  const c = FAMILY_BOARD.columns;
  const now = new Date();
  const due = new Date(now.getTime() + FAMILY_BOARD.callDueDays * 24 * 60 * 60 * 1000);

  const callDue = sastParts(due).slice(0, 10);
  const values: Record<string, unknown> = {
    [c.relationship]: { label: f.relationship },
    [c.phone]: { phone: f.phone, countryShortName: "ZA" },
    [c.whatsapp]: { label: f.whatsapp },
    [c.contactVia]: { labels: f.contactVia },
    [c.learnerName]: f.learnerName,
    [c.learnerSchool]: f.learnerSchool,
    [c.learnerGrade]: f.learnerGrade,
    [c.programmes]: { labels: f.programmes },
    [c.source]: f.source,
    [c.consent]: { checked: "true" },
    [c.consentWording]: { text: JOIN_CONSENT_TEXT },
    [c.consentVersion]: JOIN_CONSENT_VERSION,
    [c.consentAt]: `${sastParts(now)} SAST`,
    [c.submittedVia]: FAMILY_BOARD.submittedVia,
    [c.followUpStatus]: { label: FAMILY_BOARD.followUpStatusNew },
    [c.callDue]: { date: callDue },
  };
  if (f.email) values[c.email] = { email: f.email, text: f.email };
  if (f.area) values[c.area] = f.area;
  if (f.bestTime) values[c.bestTime] = { label: f.bestTime };
  if (f.otherLearners) values[c.otherLearners] = { text: f.otherLearners };
  if (f.familyInterest.length) values[c.familyInterest] = { labels: f.familyInterest };
  if (f.notes) values[c.notes] = { text: f.notes };
  if (f.heardAbout) values[c.heardAbout] = { label: f.heardAbout };

  const res = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token, "API-Version": "2024-01" },
    body: JSON.stringify({
      query: `mutation($board: ID!, $name: String!, $vals: JSON!) {
        create_item(board_id: $board, item_name: $name, column_values: $vals) { id }
      }`,
      variables: { board: FAMILY_BOARD.id, name: f.name, vals: JSON.stringify(values) },
    }),
    cache: "no-store",
  });
  const json = (await res.json()) as { data?: { create_item?: { id?: string } }; errors?: { message: string }[] };
  if (json.errors?.length) {
    // Keep the reason for the server log, but mask anything that looks like a phone number or an email address.
    const msg = json.errors[0].message.replace(/[^\s@]+@[^\s@]+/g, "[email]").replace(/\+?\d[\d\s-]{6,}/g, "[number]").slice(0, 200);
    throw new Error(`monday: ${msg}`);
  }
  const id = json.data?.create_item?.id;
  if (!id) throw new Error("monday: no item id returned");
  return { id, callDue };
}
