import {
  BEST_TIMES,
  CONTACT_METHODS,
  FAMILY_INTERESTS,
  GRADES,
  HEARD_ABOUT,
  JOIN_MIN_FORM_TIME_MS,
  PROGRAMMES,
  RELATIONSHIPS,
  type JoinSource,
} from "@/config/join";
import { cleanSource } from "./source";

export interface JoinBody {
  name?: unknown;
  relationship?: unknown;
  phone?: unknown;
  whatsapp?: unknown;
  email?: unknown;
  area?: unknown;
  contactVia?: unknown;
  bestTime?: unknown;
  learnerName?: unknown;
  learnerSchool?: unknown;
  learnerGrade?: unknown;
  programmes?: unknown;
  otherLearners?: unknown;
  familyInterest?: unknown;
  notes?: unknown;
  heardAbout?: unknown;
  consent?: unknown;
  src?: unknown;
  website?: unknown; // honeypot
  elapsedMs?: unknown; // time the form has been on screen (ms), measured in the browser
  turnstileToken?: unknown;
}

export interface CleanJoin {
  name: string;
  relationship: (typeof RELATIONSHIPS)[number];
  phone: string; // +27XXXXXXXXX
  whatsapp: "Yes" | "No";
  email: string | null;
  area: string;
  contactVia: string[];
  bestTime: string | null;
  learnerName: string;
  learnerSchool: string;
  learnerGrade: string;
  programmes: string[];
  otherLearners: string;
  familyInterest: string[];
  notes: string;
  heardAbout: string | null;
  source: JoinSource;
}

export type JoinValidation = { ok: true; value: CleanJoin } | { ok: false; error: string; field: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Plain text only: no control characters or angle brackets, single spaces. The board shows text, never HTML.
const clean = (v: unknown, max: number, multiline = false) => {
  if (typeof v !== "string") return "";
  let s = v.replace(/[<>]/g, " ").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
  s = multiline ? s.replace(/[ \t]+/g, " ").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  return s.trim().slice(0, max + 1);
};

function pickMany<T extends string>(v: unknown, allowed: readonly T[]): T[] | null {
  if (!Array.isArray(v) || v.length > allowed.length) return null;
  const out = [...new Set(v)];
  return out.every((x): x is T => typeof x === "string" && (allowed as readonly string[]).includes(x)) ? out : null;
}
function pickOne<T extends string>(v: unknown, allowed: readonly T[]): T | null {
  return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : null;
}

/** South African numbers only: 082 123 4567, +27 82 123 4567 and 27821234567 all become +27821234567. */
export function normalisePhone(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length > 30) return null;
  const digits = raw.replace(/[\s\-().]/g, "");
  const m = /^(?:\+27|0027|27|0)([1-8]\d{8})$/.exec(digits);
  return m ? `+27${m[1]}` : null;
}

export const honeypotFilled = (b: JoinBody) => typeof b.website === "string" && b.website.trim() !== "";
export const submittedTooFast = (b: JoinBody) =>
  !(typeof b.elapsedMs === "number" && Number.isFinite(b.elapsedMs) && b.elapsedMs >= JOIN_MIN_FORM_TIME_MS);

export function validateJoin(b: JoinBody): JoinValidation {
  const fail = (field: string, error: string): JoinValidation => ({ ok: false, field, error });

  const name = clean(b.name, 100);
  if (!name || name.length > 100) return fail("name", "Please enter your full name.");

  const relationship = pickOne(b.relationship, RELATIONSHIPS);
  if (!relationship) return fail("relationship", "Please choose how you are related to the learner.");

  const phone = normalisePhone(b.phone);
  if (!phone) return fail("phone", "Please enter a South African cell number, for example 082 123 4567.");

  const whatsapp = pickOne(b.whatsapp, ["Yes", "No"] as const);
  if (!whatsapp) return fail("whatsapp", "Please tell us if this number is on WhatsApp.");

  const emailRaw = clean(b.email, 254).toLowerCase();
  if (emailRaw && (emailRaw.length > 254 || !EMAIL_RE.test(emailRaw))) return fail("email", "Please enter a valid email address, or leave it blank.");

  const area = clean(b.area, 100);
  if (area.length > 100) return fail("area", "Area or suburb is too long.");

  const contactVia = pickMany(b.contactVia, CONTACT_METHODS);
  if (!contactVia || contactVia.length === 0) return fail("contactVia", "Please choose at least one way for us to contact you.");
  if (contactVia.includes("Email") && !emailRaw) return fail("email", "You chose email, so please enter your email address.");

  const bestTime = b.bestTime === "" || b.bestTime === undefined ? null : pickOne(b.bestTime, BEST_TIMES);
  if (b.bestTime !== "" && b.bestTime !== undefined && !bestTime) return fail("bestTime", "Please choose a time from the list.");

  const learnerName = clean(b.learnerName, 100);
  if (!learnerName || learnerName.length > 100) return fail("learnerName", "Please enter the learner's first name and surname.");
  const learnerSchool = clean(b.learnerSchool, 120);
  if (!learnerSchool || learnerSchool.length > 120) return fail("learnerSchool", "Please enter the learner's school.");
  const learnerGrade = pickOne(b.learnerGrade, GRADES);
  if (!learnerGrade) return fail("learnerGrade", "Please choose the learner's grade.");

  const programmes = pickMany(b.programmes, PROGRAMMES);
  if (!programmes || programmes.length === 0) return fail("programmes", "Please choose at least one programme, or choose \"Not sure yet\".");

  const otherLearners = clean(b.otherLearners, 1000, true);
  if (otherLearners.length > 1000) return fail("otherLearners", "That is too long. Please keep it under 1000 characters.");

  const familyInterest = b.familyInterest === undefined ? [] : pickMany(b.familyInterest, FAMILY_INTERESTS);
  if (!familyInterest) return fail("familyInterest", "Please choose from the list.");

  const notes = clean(b.notes, 1000, true);
  if (notes.length > 1000) return fail("notes", "That is too long. Please keep it under 1000 characters.");

  const heardAbout = b.heardAbout === "" || b.heardAbout === undefined ? null : pickOne(b.heardAbout, HEARD_ABOUT);
  if (b.heardAbout !== "" && b.heardAbout !== undefined && !heardAbout) return fail("heardAbout", "Please choose from the list.");

  if (b.consent !== true) return fail("consent", "Please tick the box so we know you agree.");

  return {
    ok: true,
    value: {
      name,
      relationship,
      phone,
      whatsapp,
      email: emailRaw || null,
      area,
      contactVia,
      bestTime,
      learnerName,
      learnerSchool,
      learnerGrade,
      programmes,
      otherLearners,
      familyInterest,
      notes,
      heardAbout,
      source: cleanSource(typeof b.src === "string" ? b.src : null),
    },
  };
}
