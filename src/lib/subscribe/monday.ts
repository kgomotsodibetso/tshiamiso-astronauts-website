import { AUDIENCES, CONSENT_VERSION, LANGUAGES, MONDAY, TOPICS, type AudienceKey, type LanguageKey, type Placement, type TopicKey } from "@/config/subscribe";

const API = "https://api.monday.com/v2";

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
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

type ColKey = keyof typeof MONDAY.columns;
let columnCache: { at: number; ids: Record<ColKey, string> } | null = null;

/** Match Audience board columns by title (ids are the fallback), so a re-ordered board still works. */
async function columnIds(): Promise<Record<ColKey, string>> {
  if (columnCache && Date.now() - columnCache.at < 10 * 60 * 1000) return columnCache.ids;
  const ids = Object.fromEntries(
    (Object.keys(MONDAY.columns) as ColKey[]).map((k) => [k, MONDAY.columns[k].id]),
  ) as Record<ColKey, string>;
  try {
    const data = await gql<{ boards: { columns: { id: string; title: string }[] }[] }>(
      `query($id: [ID!]) { boards(ids: $id) { columns { id title } } }`,
      { id: [String(MONDAY.audienceBoardId)] },
    );
    const cols = data.boards?.[0]?.columns ?? [];
    for (const k of Object.keys(MONDAY.columns) as ColKey[]) {
      const hit = cols.find((c) => c.title.trim().toLowerCase() === MONDAY.columns[k].title.toLowerCase());
      if (hit) ids[k] = hit.id;
    }
  } catch (err) {
    console.warn("[Subscribe] Could not read monday column list, using built-in ids:", (err as Error).message);
  }
  columnCache = { at: Date.now(), ids };
  return ids;
}

interface ExistingItem {
  id: string;
  cols: Record<string, { text: string | null; value: string | null }>;
}

async function findByEmail(email: string, ids: Record<ColKey, string>): Promise<ExistingItem | null> {
  const wanted = Object.values(ids);
  const data = await gql<{
    items_page_by_column_values: {
      items: { id: string; column_values: { id: string; text: string | null; value: string | null }[] }[];
    };
  }>(
    `query($board: ID!, $col: String!, $email: String!, $cols: [String!]) {
       items_page_by_column_values(board_id: $board, limit: 5, columns: [{ column_id: $col, column_values: [$email] }]) {
         items { id column_values(ids: $cols) { id text value } }
       }
     }`,
    { board: String(MONDAY.audienceBoardId), col: ids.email, email, cols: wanted },
  );
  const item = data.items_page_by_column_values?.items?.[0];
  if (!item) return null;
  return { id: item.id, cols: Object.fromEntries(item.column_values.map((c) => [c.id, c])) };
}

const sast = (d = new Date()) =>
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
    .replace(",", "");

export interface MondayInput {
  email: string;
  firstName: string;
  audience: AudienceKey;
  topics: TopicKey[];
  language: LanguageKey | null;
  placement: Placement;
  src: string | null;
  page: string;
  /** Identifies this sign-up (token issue time), so a second click on the same link adds no second note. */
  ref: string;
}

/**
 * Find the subscriber's row by email and update it, or create it. Never deletes anything and never
 * creates a duplicate. On an existing row we only fill in blanks (segment, language, source),
 * widen topics, and append to Notes; we do not overwrite someone's earlier consent basis if they
 * are already set to Send.
 */
export async function upsertAudienceRow(s: MondayInput): Promise<{ created: boolean; itemId: string }> {
  const ids = await columnIds();
  const existing = await findByEmail(s.email, ids);

  const stamp = sast(); // "YYYY-MM-DD HH:mm" in SAST
  const today = stamp.slice(0, 10);
  const note = `Website sign-up confirmed ${stamp} SAST. Page: ${s.page}. Consent text version: ${CONSENT_VERSION}. Ref: ${s.ref}.`;
  const source = `Website: ${s.placement}${s.src ? ` (${s.src})` : ""}`;
  const newTopics = [...new Set(s.topics.flatMap((k) => TOPICS[k].mondayTopics))];
  const text = (key: ColKey) => existing?.cols[ids[key]]?.text?.trim() ?? "";

  const values: Record<string, unknown> = {
    [ids.updated]: { date: today },
  };

  if (!existing) {
    Object.assign(values, {
      [ids.email]: { email: s.email, text: s.email },
      [ids.firstName]: s.firstName,
      [ids.segment]: { label: AUDIENCES[s.audience].mondaySegment },
      [ids.channel]: { label: MONDAY.channelEmail },
      [ids.source]: source,
      [ids.status]: { label: MONDAY.statusSend },
      [ids.consentBasis]: { label: MONDAY.consentBasis },
      [ids.topics]: { labels: newTopics },
      [ids.notes]: { text: note },
    });
    if (s.language) values[ids.language] = { label: LANGUAGES[s.language].mondayLabel };

    const data = await gql<{ create_item: { id: string } }>(
      `mutation($board: ID!, $name: String!, $vals: JSON!) {
         create_item(board_id: $board, item_name: $name, column_values: $vals) { id }
       }`,
      { board: String(MONDAY.audienceBoardId), name: s.firstName, vals: JSON.stringify(values) },
    );
    return { created: true, itemId: data.create_item.id };
  }

  if (!text("firstName")) values[ids.firstName] = s.firstName;
  if (!text("segment")) values[ids.segment] = { label: AUDIENCES[s.audience].mondaySegment };
  if (!text("source")) values[ids.source] = source;
  if (s.language && !text("language")) values[ids.language] = { label: LANGUAGES[s.language].mondayLabel };
  if (!text("channel")) values[ids.channel] = { label: MONDAY.channelEmail };

  // Topics wanted: empty means "all topics", so leave an empty cell alone. Otherwise widen it.
  const current = text("topics");
  if (current) {
    const merged = [...new Set([...current.split(",").map((t) => t.trim()).filter(Boolean), ...newTopics])];
    values[ids.topics] = { labels: merged };
  }

  if (text("status") !== MONDAY.statusSend) {
    values[ids.status] = { label: MONDAY.statusSend };
    values[ids.consentBasis] = { label: MONDAY.consentBasis };
  }

  const prior = text("notes");
  if (!prior.includes(`Ref: ${s.ref}.`)) values[ids.notes] = { text: prior ? `${prior}\n${note}` : note };

  await gql(
    `mutation($board: ID!, $item: ID!, $vals: JSON!) {
       change_multiple_column_values(board_id: $board, item_id: $item, column_values: $vals) { id }
     }`,
    { board: String(MONDAY.audienceBoardId), item: existing.id, vals: JSON.stringify(values) },
  );
  return { created: false, itemId: existing.id };
}
