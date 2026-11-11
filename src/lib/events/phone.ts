// Phone rule shared by the RSVP form (browser) and its server action, so both accept exactly the same numbers.
const PHONE_RE = /^\+?[\d\s()-]+$/;

export const PHONE_ERROR = "Please enter a valid phone number.";

export function isValidPhone(phone: string): boolean {
  const value = phone.trim();
  const digits = value.replace(/\D/g, "").length;
  return value.length <= 20 && PHONE_RE.test(value) && digits >= 9 && digits <= 15;
}
