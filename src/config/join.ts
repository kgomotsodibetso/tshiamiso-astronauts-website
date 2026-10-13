// Everything the /join sign-up form needs. IDs and wording are not secrets.
// The monday token lives in Vercel env vars only (MONDAY_API_TOKEN, see .env.example).

export const JOIN_SOURCES = ["flyer", "poster", "card", "desk", "school", "social", "whatsapp"] as const;
export type JoinSource = (typeof JOIN_SOURCES)[number] | "other";

export const SUPPORT_EMAIL = "info@tshiamisoastronauts.org";

// Private board "TA_FamilyInterest_JoinTheAstronauts_V1_20261011". The 2026 Learner Enrollment board is never used.
// The columns are shared with the monday WorkForm, so the same ids are used.
export const FAMILY_BOARD = {
  id: "5105828999",
  columns: {
    phone: "phoneei9kos0k",
    whatsapp: "single_selectrghu5jf",
    email: "emailp12qjsmg",
    area: "short_textq962yxfm",
    learnerName: "short_textqdqdzk76",
    learnerSchool: "short_textqj2ui0uj",
    learnerGrade: "short_textas1gztol",
    otherChildren: "long_textfq3nwg67",
    source: "short_textehqada9w",
    consent: "booleand2lm80ji",
    followUpStatus: "color_mm818mr7",
    callDue: "date_mm81c9jt",
    // Added for the website form only (the WorkForm leaves these blank).
    consentWording: "long_text_mm81pnyg",
    consentVersion: "text_mm81k8e0",
    consentAt: "text_mm8192ge",
    submittedVia: "text_mm81t46n",
  },
  itemUrl: (itemId: string) => `https://tshiamisoastronauts.monday.com/boards/5105828999/pulses/${itemId}`,
  followUpStatusNew: "Not yet called",
  callDueDays: 7,
  submittedVia: "Website form",
} as const;

// Homework Assistance runs for Grades 1 to 12.
export const GRADES = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);

// Bump the version when the wording changes. Both are stored with every sign-up.
// The wording is the same as on the monday WorkForm.
export const JOIN_CONSENT_VERSION = "web-join-2026-10-12-v2";
export const JOIN_CONSENT_TEXT =
  "I am the parent or guardian of the learner(s) listed. I agree that Tshiamiso Astronauts NPC may contact me about Homework Assistance and its other programmes by call, WhatsApp, SMS or email. I can ask to see, correct or delete my information at any time.";

export const JOIN_MIN_FORM_TIME_MS = 8000; // a family cannot fill this form in under 8 seconds

export const JOIN_MESSAGES = {
  generic: `Something went wrong. Please try again, or email ${SUPPORT_EMAIL}.`,
  tooMany: "Too many attempts. Please try again later, or email " + SUPPORT_EMAIL + ".",
  captcha: `We could not confirm you are human. Please refresh the page and try again, or email ${SUPPORT_EMAIL}.`,
} as const;
