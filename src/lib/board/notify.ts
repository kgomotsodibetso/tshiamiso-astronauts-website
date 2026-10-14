// Helpers for the Board emails (applicant and nominator confirmations, and the heads-up to info@).
import { createHash } from "node:crypto";
import { boardConfirmEmailRatelimit } from "@/lib/ratelimit";

// Link to one item on a Board board, for the staff notification.
export const mondayItemUrl = (boardId: string, itemId: string) =>
  `https://tshiamisoastronauts.monday.com/boards/${encodeURIComponent(boardId)}/pulses/${encodeURIComponent(itemId)}`;

/**
 * At most 3 confirmation emails a day to the same address (the key is a hash, never the address), so the
 * forms cannot be used to flood one person's inbox. If the limiter is unavailable we allow the email.
 */
export async function confirmationAllowed(email: string): Promise<boolean> {
  try {
    const key = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
    return (await boardConfirmEmailRatelimit.limit(key)).success;
  } catch {
    console.warn("[Board] confirmation email limit check failed, failing open");
    return true;
  }
}
