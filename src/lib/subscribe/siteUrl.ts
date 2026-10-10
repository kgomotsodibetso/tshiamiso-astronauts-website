// Base URL used in links we email out. Never taken from the request (Host header injection).
// Production: NEXT_PUBLIC_SITE_URL or the live domain. Preview: that deployment's own URL, so
// the confirm link in a test email lands on the preview being tested.
export function siteUrl(): string {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.tshiamisoastronauts.org").replace(/\/$/, "");
}
