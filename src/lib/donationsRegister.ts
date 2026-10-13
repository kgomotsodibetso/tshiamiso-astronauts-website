import type { ReceiptStore } from "@/lib/receipts";

// Monday.com board TA_Donations_Register_2026: one row per donation, with the certificate PDF attached.
// Column and group ids come from TA_Handover_ClaudeCode_DonationsRegisterBoard_V1 (12 Oct 2026).
const API = "https://api.monday.com/v2";
const FILE_API = "https://api.monday.com/v2/file";

const boardId = () => process.env.MONDAY_DONATIONS_BOARD_ID || "5105898212";

const GROUP_REAL = "topics"; // "2026/27 tax year" (top group)

const COL = {
  date: "date_mm82y9q",
  donorName: "text_mm82586x",
  donorEmail: "email_mm82hazm",
  address: "text_mm822d10",
  idNumber: "text_mm82k5yn",
  gross: "numeric_mm82m30m",
  fee: "numeric_mm827bfg",
  net: "numeric_mm82zb61",
  type: "color_mm82zphs",
  source: "color_mm82wgtt",
  paymentId: "text_mm82jtbf",
  certificate: "file_mm829326",
  emailed: "color_mm82jcvs",
  status: "color_mm82mkzq",
  taxYear: "color_mm82nnq7",
  notes: "long_text_mm82mj0j",
} as const;

export interface RegisterEntry {
  paymentId: string;
  /** Missing when no certificate could be issued. */
  receiptNumber?: string;
  certificatePdf?: Uint8Array;
  date: Date;
  donorName: string;
  donorEmail: string;
  address?: string;
  idNumber?: string;
  gross: number;
  fee: number;
  net: number;
  recurring: boolean;
}

export interface RegisterResult {
  itemId: string;
  /** False when the row exists but the PDF could not be attached. */
  fileAttached: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sastDate = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

/** SARS tax year runs 1 March to the end of February: 12 Oct 2026 is "2026/27". */
export function sarsTaxYear(d: Date): string {
  const [y, m] = sastDate(d).split("-").map(Number);
  const start = m >= 3 ? y : y - 1;
  return `${start}/${String(start + 1).slice(2)}`;
}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) throw new Error("MONDAY_API_TOKEN is not set");
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token, "API-Version": "2024-01" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(`monday: ${json.errors[0].message}`);
  if (!json.data) throw new Error("monday: empty response");
  return json.data;
}

async function attachCertificate(itemId: string, pdf: Uint8Array, filename: string): Promise<void> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token || !/^\d+$/.test(itemId)) throw new Error("cannot attach certificate");
  const query = `mutation ($file: File!) {
    add_file_to_column(item_id: ${itemId}, column_id: "${COL.certificate}", file: $file) { id }
  }`;
  const fd = new FormData();
  fd.append("query", query);
  fd.append("variables[file]", new Blob([Buffer.from(pdf)], { type: "application/pdf" }), filename);
  const res = await fetch(FILE_API, { method: "POST", headers: { Authorization: token, "API-Version": "2024-01" }, body: fd });
  const json = (await res.json()) as { errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(`monday file upload: ${json.errors[0].message}`);
}

const setValues = (itemId: string, values: Record<string, unknown>) =>
  gql(
    `mutation($board: ID!, $item: ID!, $vals: JSON!) {
       change_multiple_column_values(board_id: $board, item_id: $item, column_values: $vals) { id }
     }`,
    { board: boardId(), item: itemId, vals: JSON.stringify(values) },
  );

/**
 * Adds the donation to the register. Safe to call again for the same payment (PayFast retries): the row
 * is created once and its id remembered in the receipt store. Throws if the row could not be created.
 */
export async function saveDonation(store: ReceiptStore | null, e: RegisterEntry): Promise<RegisterResult> {
  const memoKey = `ta:18a:register:${e.paymentId}`;
  const known = store ? await store.get(memoKey) : null;
  if (known) return { itemId: known, fileAttached: true };

  const issued = !!e.receiptNumber;
  const values: Record<string, unknown> = {
    [COL.date]: { date: sastDate(e.date) },
    [COL.donorName]: e.donorName,
    [COL.gross]: e.gross.toFixed(2),
    [COL.fee]: e.fee.toFixed(2),
    [COL.net]: e.net.toFixed(2),
    [COL.type]: { label: e.recurring ? "Monthly" : "Once-off" },
    [COL.source]: { label: "Website - PayFast" },
    [COL.paymentId]: e.paymentId,
    [COL.emailed]: { label: "No" }, // flipped to "Yes" once the donor email is out
    [COL.status]: { label: issued ? "Issued" : "Not issued - action needed" },
    [COL.taxYear]: { label: sarsTaxYear(e.date) },
  };
  if (EMAIL_RE.test(e.donorEmail)) values[COL.donorEmail] = { email: e.donorEmail, text: e.donorEmail };
  if (e.address) values[COL.address] = e.address;
  if (e.idNumber) values[COL.idNumber] = e.idNumber;
  if (!issued) values[COL.notes] = { text: "No certificate was issued automatically. Issue one by hand and attach it here." };

  const created = await gql<{ create_item: { id: string } }>(
    `mutation($board: ID!, $group: String!, $name: String!, $vals: JSON!) {
       create_item(board_id: $board, group_id: $group, item_name: $name, column_values: $vals, create_labels_if_missing: true) { id }
     }`,
    { board: boardId(), group: GROUP_REAL, name: e.receiptNumber ?? `PF-${e.paymentId}`, vals: JSON.stringify(values) },
  );
  const itemId = created.create_item.id;
  if (store) await store.set(memoKey, itemId).catch(() => undefined);

  let fileAttached = true;
  if (e.certificatePdf && e.receiptNumber) {
    try {
      await attachCertificate(itemId, e.certificatePdf, `TA_18A_Certificate_${e.receiptNumber}.pdf`);
    } catch (err) {
      fileAttached = false;
      console.error("[Register] Certificate PDF not attached:", (err as Error).message);
      await setValues(itemId, {
        [COL.notes]: { text: "Certificate PDF was not attached automatically. Attach it from the info@ copy of the donor email." },
      }).catch(() => undefined);
    }
  }
  return { itemId, fileAttached };
}

export const markDonorEmailed = (itemId: string) => setValues(itemId, { [COL.emailed]: { label: "Yes" } });
