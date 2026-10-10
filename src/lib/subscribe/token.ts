import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// Tokens are AES-256-GCM: the address is unreadable in a URL or log, and any change to the
// token (or a wrong key) fails authentication. No database needed. `purpose` stops a
// "confirmed page" token being used as a confirm link, and the other way round.

export type TokenPurpose = "confirm" | "confirmed";

interface Envelope<T> {
  p: TokenPurpose;
  iat: number;
  d: T;
}

function key(): Buffer {
  const secret = process.env.SUBSCRIBE_TOKEN_SECRET;
  if (!secret || secret.length < 16) throw new Error("SUBSCRIBE_TOKEN_SECRET is not set");
  return createHash("sha256").update(secret).digest();
}

export function sealToken<T>(purpose: TokenPurpose, data: T, now = Date.now()): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([
    cipher.update(JSON.stringify({ p: purpose, iat: now, d: data } satisfies Envelope<T>), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

export type OpenResult<T> =
  | { ok: true; data: T; issuedAt: number }
  | { ok: false; reason: "invalid" | "expired" };

export function openToken<T>(
  token: string,
  purpose: TokenPurpose,
  ttlMs: number,
  now = Date.now(),
): OpenResult<T> {
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length < 12 + 16 + 2) return { ok: false, reason: "invalid" };
    const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const json = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
    const env = JSON.parse(json) as Envelope<T>;
    if (env.p !== purpose || typeof env.iat !== "number") return { ok: false, reason: "invalid" };
    if (now - env.iat > ttlMs || env.iat > now + 60_000) return { ok: false, reason: "expired" };
    return { ok: true, data: env.d, issuedAt: env.iat };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

// Short, non-reversible tag for logs. Never log the address itself.
export function emailTag(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 12);
}
