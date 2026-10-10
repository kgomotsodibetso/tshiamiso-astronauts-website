import type { AudienceKey, LanguageKey, Placement, SubscribeVariant, TopicKey } from "@/config/subscribe";
import { emailTag } from "./token";
import { fireWelcomeEvent, upsertContact } from "./resend";
import { upsertAudienceRow } from "./monday";

/** What travels inside the encrypted confirm token. */
export interface ConfirmPayload {
  email: string;
  firstName: string;
  audience: AudienceKey;
  topics: TopicKey[];
  language: LanguageKey | null;
  placement: Placement;
  src: string | null;
  page: string;
  variant: SubscribeVariant;
  consentVersion: string;
  consentText: string;
}

async function retryOnce<T>(label: string, tag: string, fn: () => Promise<T>): Promise<T | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = String((err as Error)?.message ?? err).replace(/[^\s@]+@[^\s@]+/g, "[email]");
      console.error(`[Subscribe] ${label} failed (attempt ${attempt}) for ${tag}: ${msg}`);
      if (attempt === 1) await new Promise((r) => setTimeout(r, 700)); // stay under Resend's 10 requests a second
    }
  }
  return null;
}

/**
 * Run after the visitor has clicked the confirm link. Resend and monday are independent:
 * if one fails after a retry we log it (hashed email only) and carry on, so the visitor
 * is never told it failed after they have confirmed. Cowork reconciles from the log.
 */
export async function completeSignup(p: ConfirmPayload, issuedAt: number): Promise<{ alreadySubscribed: boolean }> {
  const tag = emailTag(p.email);

  const resendOutcome = await retryOnce("Resend contact", tag, () => upsertContact(p));
  if (resendOutcome?.sendWelcome) {
    await retryOnce("Resend welcome event", tag, () => fireWelcomeEvent(p.email, p.variant));
  }

  const row = await retryOnce("monday row", tag, () => upsertAudienceRow({ ...p, ref: issuedAt.toString(36) }));

  console.log(
    `[Subscribe] confirmed ${tag} variant=${p.variant} placement=${p.placement} ` +
      `resend=${resendOutcome ? (resendOutcome.created ? "created" : "existing") : "FAILED"} ` +
      `monday=${row ? (row.created ? "created" : "updated") : "FAILED"} ` +
      `welcome=${resendOutcome?.sendWelcome ? "sent" : "no"}`,
  );

  // Only true when we positively found an active contact. A failure is never reported as "already".
  return { alreadySubscribed: !!resendOutcome && !resendOutcome.sendWelcome && !resendOutcome.created };
}
