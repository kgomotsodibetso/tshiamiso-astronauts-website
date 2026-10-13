// Checks every Board submission passes before anything is read or written: closing date,
// rate limit per visitor, then the Cloudflare human check. Returns an error message, or null to carry on.
import { headers } from "next/headers";
import { clientIpFrom } from "@/lib/clientIp";
import { formRatelimit } from "@/lib/ratelimit";
import { verifyTurnstile } from "@/lib/subscribe/turnstile";
import { isBoardClosed } from "@/config/board";

export async function guardSubmission(formData: FormData, label: string): Promise<string | null> {
  if (isBoardClosed()) return "Applications and nominations are now closed.";

  const ip = clientIpFrom(await headers());
  try {
    const { success } = await formRatelimit.limit(`board:${ip ?? "anonymous"}`);
    if (!success) return "Too many attempts. Please wait a few minutes and try again.";
  } catch {
    console.warn(`[Board:${label}] rate limit check failed, failing open`);
  }

  const human = await verifyTurnstile(formData.get("turnstileToken"), ip);
  if (!human.ok) {
    console.warn(`[Board:${label}] refused: captcha ${human.reason}`);
    return "We could not confirm you are human. Please refresh the page and try again.";
  }
  return null;
}
