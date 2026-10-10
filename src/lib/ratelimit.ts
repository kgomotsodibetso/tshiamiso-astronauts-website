import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Fail-open stub used when Redis env vars are not configured
const allowAll = { limit: async () => ({ success: true }) } as unknown as Ratelimit;

function makeRatelimit(prefix: string, limiter: Ratelimit["limiter"]): Ratelimit {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn(`[Ratelimit] Upstash env vars missing — rate limiting disabled for "${prefix}"`);
    return allowAll;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter,
    // Off on purpose: Upstash analytics keeps every visitor's IP address with no expiry. The rate-limit
    // keys themselves expire on their own (about 2 hours for the hourly window, 2 days for the daily one).
    analytics: false,
    prefix,
  });
}

// Contact form + RSVP: 5 submissions per 10 minutes per IP
export const formRatelimit = makeRatelimit("rl:form", Ratelimit.slidingWindow(5, "10 m"));

// PayFast ITN: 30 requests per minute per IP (PayFast retries on non-200)
export const payfastRatelimit = makeRatelimit("rl:payfast", Ratelimit.slidingWindow(30, "1 m"));

// Subscribe form: 5 sign-ups an hour per IP, and 3 confirmation emails a day per address
// (stops anyone using us to flood one inbox, and protects the 100 emails a day Resend allows).
export const subscribeIpRatelimit = makeRatelimit("rl:subscribe-ip", Ratelimit.slidingWindow(5, "1 h"));
export const subscribeEmailRatelimit = makeRatelimit("rl:subscribe-email", Ratelimit.slidingWindow(3, "1 d"));
