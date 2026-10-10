// Short-lived, HttpOnly cookies carry the confirmation token between the email link and the pages
// that follow it, so the token never appears in a page address. Google's tag, Cloudflare Web Analytics
// and Vercel Speed Insights record page addresses, and none of them may ever see the token.
// HttpOnly means scripts on the page (including any tag) cannot read these cookies.
// They are strictly necessary for the confirmation to work, and they expire on their own.

export const CONFIRM_COOKIE = "ta_confirm"; // the 48-hour email token, valid for 30 minutes here
export const CONFIRMED_COOKIE = "ta_confirmed"; // encrypted first name for the thank-you page, 15 minutes

export const CONFIRM_COOKIE_PATH = "/subscribe/confirm";
export const CONFIRMED_COOKIE_PATH = "/subscribe/confirmed";

export const cookieOptions = (path: string, maxAgeSeconds: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path,
  maxAge: maxAgeSeconds,
});
