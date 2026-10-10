// Everything the subscribe flow needs to know about Resend, monday and the copy it shows.
// IDs are not secrets. Keys and tokens live in Vercel env vars only (see .env.example).

export type TopicKey = "newsletter" | "events" | "volunteer" | "giving";
export type AudienceKey = "parent" | "volunteer" | "school" | "supporter";
export type LanguageKey = "english" | "sesotho" | "isizulu" | "other";
export type SubscribeVariant = "short" | "full";

export const TOPICS: Record<
  TopicKey,
  { label: string; resendTopicId: string; mondayTopics: string[] }
> = {
  newsletter: {
    label: "Monthly newsletter",
    resendTopicId: "1b1bc27e-6dc7-4470-887a-ae722bc615ef",
    mondayTopics: ["Programme news", "Impact stories"],
  },
  events: {
    label: "Events and invitations",
    resendTopicId: "e9e75822-fb10-4b38-be69-8298a66852c5",
    mondayTopics: ["Spelling Bee and events"],
  },
  volunteer: {
    label: "Volunteer opportunities",
    resendTopicId: "c318b22e-a865-4d95-8aef-cd6f44376c30",
    mondayTopics: ["Volunteer opportunities"],
  },
  giving: {
    label: "Giving and partnerships",
    resendTopicId: "d742840a-df00-4983-97ef-577e295fc51d",
    mondayTopics: ["Ways to support TA"],
  },
};
export const TOPIC_KEYS = Object.keys(TOPICS) as TopicKey[];

// "I am a..." -> Resend segment and monday Segment label.
export const AUDIENCES: Record<
  AudienceKey,
  { label: string; resendSegmentId: string; mondaySegment: string }
> = {
  parent: {
    label: "Parent or guardian",
    resendSegmentId: "e7063b37-52d9-42c2-82cb-8564aba73117", // Parents and Guardians
    mondaySegment: "Parent/Guardian",
  },
  volunteer: {
    label: "Volunteer",
    resendSegmentId: "bf088a17-0e68-4690-a810-37929bafb0eb", // Volunteers
    mondaySegment: "Volunteer",
  },
  school: {
    label: "School or partner",
    resendSegmentId: "46d570e2-66c9-45de-92fc-e248098f336a", // Partners and Supporters
    mondaySegment: "Sponsor/Partner",
  },
  supporter: {
    label: "Supporter or other",
    resendSegmentId: "46d570e2-66c9-45de-92fc-e248098f336a", // Partners and Supporters
    mondaySegment: "Sponsor/Partner",
  },
};
export const DEFAULT_AUDIENCE: AudienceKey = "supporter";

export const LANGUAGES: Record<LanguageKey, { label: string; mondayLabel: string }> = {
  english: { label: "English", mondayLabel: "English" },
  sesotho: { label: "Sesotho", mondayLabel: "Sesotho" },
  isizulu: { label: "isiZulu", mondayLabel: "isiZulu" },
  other: { label: "Other", mondayLabel: "Unknown" },
};

export const RESEND = {
  confirmTemplateId: "ta-confirm-v1", // id aa8a2795-6a51-46ef-a3dd-c9954ae2b14d
  eventFull: "subscriber.confirmed",
  eventNewsletterOnly: "subscriber.confirmed_newsletter",
  replyTo: "kgomotso@tshiamisoastronauts.org",
  from: "Tshiamiso Astronauts <newsletter@tshiamisoastronauts.org>",
} as const;

export const MONDAY = {
  audienceBoardId: 5105768584,
  // Column titles are matched at run time, so a re-ordered board still works. These ids are the fallback.
  columns: {
    segment: { title: "Segment", id: "color_mm7z6fkp" },
    channel: { title: "Preferred channel", id: "color_mm7z7ybs" },
    language: { title: "Home language", id: "color_mm7zwzwp" },
    email: { title: "Email", id: "email_mm7ztjy6" },
    firstName: { title: "First name", id: "text_mm7zky7" },
    source: { title: "Source", id: "text_mm7zj24m" },
    notes: { title: "Notes", id: "long_text_mm7z2cp7" },
    status: { title: "Newsletter status", id: "color_mm7zb4js" },
    consentBasis: { title: "Consent basis", id: "color_mm7zt05" },
    topics: { title: "Topics wanted", id: "dropdown_mm7zbd8w" },
    updated: { title: "Preferences updated", id: "date_mm7z641f" },
  },
  statusSend: "Send",
  consentBasis: "Website sign-up (confirmed)",
  channelEmail: "Email",
} as const;

// Bump this when the consent wording below changes. It is stored with every sign-up.
export const CONSENT_VERSION = "web-2026-10-10-v1";
export const CONSENT_TEXT = {
  short:
    "Yes, send me the monthly TA newsletter by email. I can unsubscribe at any time.",
  full:
    "I agree to receive the emails I have ticked from Tshiamiso Astronauts NPC. I can change my choices or unsubscribe at any time.",
} as const;

export const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;
export const MIN_FORM_TIME_MS = 3000;

// Where a sign-up came from. Placements are fixed; `src` (from the URL) is allow-listed.
export const PLACEMENTS = [
  "subscribe-page",
  "header",
  "footer",
  "blog-inline",
  "blog-index",
  "blog-popup",
  "home",
  "newsletter-page",
] as const;
export type Placement = (typeof PLACEMENTS)[number];

export const SRC_ALLOW_LIST = [
  "whatsapp",
  "linkedin",
  "facebook",
  "instagram",
  "tiktok",
  "twitter",
  "email",
  "newsletter",
  "qr",
  "linktree",
] as const;

export const SUPPORT_EMAIL = "info@tshiamisoastronauts.org";

export const MESSAGES = {
  invalidEmail: "Please enter a valid email address.",
  invalidName: "Please enter your first name.",
  noConsent: "Please tick the box so we know you agree.",
  noTopic: "Please choose at least one type of email.",
  generic: `Something went wrong. Please try again, or email ${SUPPORT_EMAIL}.`,
  tooMany: "Too many attempts. Please try again later.",
} as const;

// Client-side flags (localStorage). No personal data.
export const POPUP_STORAGE = {
  dismissed: "ta_sub_dismissed",
  done: "ta_sub_done",
  session: "ta_sub_shown",
} as const;
export const POPUP_SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;
