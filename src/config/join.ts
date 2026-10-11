// Everything the /join sign-up form needs. IDs and wording are not secrets.
// The monday token lives in Vercel env vars only (MONDAY_API_TOKEN, see .env.example).

export const JOIN_SOURCES = ["flyer", "poster", "card", "desk", "school", "social", "whatsapp"] as const;
export type JoinSource = (typeof JOIN_SOURCES)[number] | "other";

export const SUPPORT_EMAIL = "info@tshiamisoastronauts.org";

// Private board "TA_FamilyInterest_JoinTheAstronauts_V1_20261011". The 2026 Learner Enrollment board is never used.
// The first block of columns is shared with the monday WorkForm, so use the same ids as that form.
export const FAMILY_BOARD = {
  id: "5105828999",
  columns: {
    relationship: "single_selectarf8exm",
    phone: "phoneei9kos0k",
    whatsapp: "single_selectrghu5jf",
    email: "emailp12qjsmg",
    area: "short_textq962yxfm",
    contactVia: "multi_selectl0tjqwin",
    bestTime: "single_select4rwalsf",
    learnerName: "short_textqdqdzk76",
    learnerSchool: "short_textqj2ui0uj",
    learnerGrade: "short_textas1gztol",
    programmes: "multi_selectdyb11ar7",
    otherLearners: "long_textfq3nwg67",
    familyInterest: "multi_selecthq639j4t",
    notes: "long_textig4tiwrg",
    heardAbout: "single_selectzkpsd7a",
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

// Option lists. The labels must match the board's labels exactly.
export const RELATIONSHIPS = [
  "Parent",
  "Guardian or caregiver",
  "Grandparent or other family member",
  "I am 18 or older and applying for myself",
] as const;
export const CONTACT_METHODS = ["Call", "WhatsApp", "SMS", "Email"] as const;
export const BEST_TIMES = ["Morning", "Afternoon", "Evening"] as const;
export const PROGRAMMES = ["Kids Reading Club", "Homework Assistance", "Digital Skills", "Not sure yet, please advise"] as const;
export const FAMILY_INTERESTS = [
  "TA Book Club",
  "Digital skills for adults",
  "I would like to volunteer or tutor",
  "University applications help for an older learner",
] as const;
export const HEARD_ABOUT = ["Event", "School", "Social media", "Friend or family", "Poster or flyer", "Website", "Other"] as const;
export const GRADES = [
  "Grade R",
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
  "Not at school",
] as const;

// Bump the version when the wording changes. Both are stored with every sign-up.
export const JOIN_CONSENT_VERSION = "web-join-2026-10-11-v1";
export const JOIN_CONSENT_TEXT =
  "I am the parent or guardian of the learner(s) listed, or I am 18 or older and applying for myself. I agree that Tshiamiso Astronauts NPC may contact me about its programmes by call, WhatsApp, SMS or email. I can ask to see, correct or delete my information at any time.";

export const JOIN_MIN_FORM_TIME_MS = 8000; // a family cannot fill this form in under 8 seconds

export const JOIN_MESSAGES = {
  generic: `Something went wrong. Please try again, or email ${SUPPORT_EMAIL}.`,
  tooMany: "Too many attempts. Please try again later, or email " + SUPPORT_EMAIL + ".",
  captcha: `We could not confirm you are human. Please refresh the page and try again, or email ${SUPPORT_EMAIL}.`,
} as const;
