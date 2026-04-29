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
    analytics: true,
    prefix,
  });
}

// Contact form + RSVP: 5 submissions per 10 minutes per IP
export const formRatelimit = makeRatelimit("rl:form", Ratelimit.slidingWindow(5, "10 m"));

// PayFast ITN: 30 requests per minute per IP (PayFast retries on non-200)
export const payfastRatelimit = makeRatelimit("rl:payfast", Ratelimit.slidingWindow(30, "1 m"));
