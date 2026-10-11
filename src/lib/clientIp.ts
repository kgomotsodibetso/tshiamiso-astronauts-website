// Visitor IP for rate limiting. The site sits behind Cloudflare, so x-forwarded-for starts with a
// Cloudflare edge address shared by many visitors. Cloudflare puts the real address in cf-connecting-ip.
export function clientIpFrom(h: { get(name: string): string | null }): string | null {
  return (
    h.get("cf-connecting-ip")?.trim() ||
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip")?.trim() ||
    null
  );
}
