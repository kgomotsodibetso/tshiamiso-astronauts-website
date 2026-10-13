import { Redis } from "@upstash/redis";

// Section 18A receipt numbers must be unique and run in sequence. The counter lives in Upstash Redis
// (INCR is atomic), one counter per calendar year. Each PayFast payment id maps to exactly one receipt
// number, so a repeated payment notification never issues a second certificate.

export interface ReceiptStore {
  get(key: string): Promise<string | null>;
  incr(key: string): Promise<number>;
  setnx(key: string, value: string): Promise<boolean>;
  set(key: string, value: string): Promise<void>;
}

function redisStore(): ReceiptStore | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  const r = Redis.fromEnv();
  return {
    get: async (k) => {
      const v = await r.get<string | number>(k);
      return v === null || v === undefined ? null : String(v);
    },
    incr: (k) => r.incr(k),
    setnx: async (k, v) => (await r.set(k, v, { nx: true })) === "OK",
    set: async (k, v) => {
      await r.set(k, v);
    },
  };
}

export const receiptStore = redisStore;

const pad = (n: number) => String(n).padStart(6, "0");

/**
 * Receipt number for a payment: reuses the number if this payment already has one, otherwise takes the
 * next one in the year's sequence. Format: 18A-2026-000001.
 */
export async function receiptNumberFor(store: ReceiptStore, paymentId: string, year: number): Promise<string> {
  const mapKey = `ta:18a:receipt:${paymentId}`;
  const existing = await store.get(mapKey);
  if (existing) return existing;

  const next = `18A-${year}-${pad(await store.incr(`ta:18a:seq:${year}`))}`;
  if (await store.setnx(mapKey, next)) return next;
  // Two notifications for the same payment arrived together; the other one won. Use its number.
  return (await store.get(mapKey)) ?? next;
}

const sentKey = (paymentId: string) => `ta:18a:sent:${paymentId}`;
export const alreadySent = async (store: ReceiptStore, paymentId: string) => (await store.get(sentKey(paymentId))) !== null;
export const markSent = (store: ReceiptStore, paymentId: string) => store.set(sentKey(paymentId), new Date().toISOString());
