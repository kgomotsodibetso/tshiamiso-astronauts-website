// Base URL used in links we email out. Never taken from the request (Host header injection).
// Production: always the www address the site is served from. NEXT_PUBLIC_SITE_URL is not used here because
// it is set to the bare domain, which Cloudflare redirects, and a redirect can lose the path and the
// confirmation token. Preview: that deployment's own URL, so
// the confirm link in a test email lands on the preview being tested.
export function siteUrl(): string {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return "https://www.tshiamisoastronauts.org";
}
