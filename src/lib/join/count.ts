import { Redis } from "@upstash/redis";
import type { JoinSource } from "@/config/join";

// A plain tally of button taps per source per day, for example field "flyer:2026-10-14".
// No cookies, no IP address, no hash of anything: it is only a number. It never blocks or slows
// the visitor, and if Redis is not set up or is down, the visitor still reaches the form.
export async function countJoinClick(source: JoinSource): Promise<void> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return;
  try {
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg" }).format(new Date());
    const redis = Redis.fromEnv();
    await Promise.race([
      redis.hincrby("join:clicks", `${source}:${day}`, 1),
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]);
  } catch {
    // Counting is a nice-to-have. Never let it get in the way.
  }
}
