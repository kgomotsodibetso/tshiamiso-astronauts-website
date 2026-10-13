// Writes Board recruitment submissions to the two private Monday.com boards.
// Server only. Candidate details are never logged: errors are reduced to Monday's own error codes.
import { safeFileName } from "./validate";

const API = "https://api.monday.com/v2";
const FILE_API = "https://api.monday.com/v2/file";
const API_VERSION = "2024-01";

type GqlError = { extensions?: { code?: string } };
type GqlResult = { data?: Record<string, { id?: string } | undefined>; errors?: GqlError[] };

async function gql(token: string, query: string, variables: Record<string, unknown>): Promise<GqlResult | null> {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token, "API-Version": API_VERSION },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    return (await res.json()) as GqlResult;
  } catch {
    return null;
  }
}

const codes = (r: GqlResult | null) => (r?.errors ?? []).map((e) => e.extensions?.code ?? "unknown").join(",") || "no_response";

const CREATE_ITEM = `mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
  create_item(board_id: $boardId, item_name: $itemName, column_values: $columnValues) { id }
}`;
const CREATE_UPDATE = `mutation ($itemId: ID!, $body: String!) {
  create_update(item_id: $itemId, body: $body) { id }
}`;

export type CreateResult = { ok: true; itemId: string } | { ok: false };

/**
 * Creates one item. If Monday refuses a column value (most often the phone column), it tries once more
 * without the phone columns and puts the numbers in an update on the item, so a good submission is never lost.
 */
export async function createBoardItem(opts: {
  label: string; // "Applications" or "Nominations", for server logs only
  boardId: string;
  name: string;
  columns: Record<string, unknown>;
  phoneColumnIds: string[];
  phoneNote: string; // text for the update if the phone columns had to be dropped
}): Promise<CreateResult> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) {
    console.error(`[Board:${opts.label}] MONDAY_API_TOKEN is not set`);
    return { ok: false };
  }

  const attempt = (columns: Record<string, unknown>) =>
    gql(token, CREATE_ITEM, { boardId: opts.boardId, itemName: opts.name, columnValues: JSON.stringify(columns) });

  let result = await attempt(opts.columns);
  let droppedPhones = false;
  if (!result?.data?.create_item?.id && result?.errors?.some((e) => e.extensions?.code === "ColumnValueException")) {
    console.warn(`[Board:${opts.label}] column value refused (${codes(result)}); retrying without phone columns`);
    const withoutPhones = Object.fromEntries(Object.entries(opts.columns).filter(([k]) => !opts.phoneColumnIds.includes(k)));
    result = await attempt(withoutPhones);
    droppedPhones = true;
  }

  const itemId = result?.data?.create_item?.id;
  if (!itemId) {
    console.error(`[Board:${opts.label}] create_item failed: ${codes(result)}`);
    return { ok: false };
  }

  if (droppedPhones && opts.phoneNote) {
    const note = await gql(token, CREATE_UPDATE, { itemId, body: opts.phoneNote });
    if (!note?.data?.create_update?.id) console.error(`[Board:${opts.label}] phone note failed: ${codes(note)}`);
  }
  console.log(`[Board:${opts.label}] created item ${itemId}`);
  return { ok: true, itemId };
}

export async function attachFile(itemId: string, columnId: string, file: File): Promise<boolean> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) return false;
  const query = `mutation ($file: File!) { add_file_to_column(item_id: ${Number(itemId)}, column_id: "${columnId}", file: $file) { id } }`;
  const fd = new FormData();
  fd.append("query", query);
  fd.append("variables[file]", file, safeFileName(file.name));
  try {
    const res = await fetch(FILE_API, {
      method: "POST",
      headers: { Authorization: token, "API-Version": API_VERSION },
      body: fd,
      cache: "no-store",
    });
    const json = (await res.json()) as GqlResult;
    if (json.errors?.length || !json.data?.add_file_to_column?.id) {
      console.error(`[Board] file upload failed: ${codes(json)}`);
      return false;
    }
    return true;
  } catch {
    console.error("[Board] file upload failed: no_response");
    return false;
  }
}

export async function addUpdate(itemId: string, body: string): Promise<void> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) return;
  const r = await gql(token, CREATE_UPDATE, { itemId, body });
  if (!r?.data?.create_update?.id) console.error(`[Board] update failed: ${codes(r)}`);
}
