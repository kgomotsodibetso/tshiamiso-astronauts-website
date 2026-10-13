import { GRADES, JOIN_MIN_FORM_TIME_MS, type JoinSource } from "@/config/join";
import { cleanSource } from "./source";

export interface JoinBody {
  name?: unknown;
  phone?: unknown;
  whatsapp?: unknown;
  email?: unknown;
  area?: unknown;
  learnerName?: unknown;
  learnerSchool?: unknown;
  learnerGrade?: unknown;
  otherChildren?: unknown;
  consent?: unknown;
  src?: unknown;
  website?: unknown; // honeypot
  elapsedMs?: unknown; // time the form has been on screen (ms), measured in the browser
  turnstileToken?: unknown;
}

export interface CleanJoin {
  name: string;
  phone: string; // +27XXXXXXXXX
  whatsapp: "Yes" | "No";
  email: string | null;
  area: string;
  learnerName: string;
  learnerSchool: string;
  learnerGrade: string;
  otherChildren: string;
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

function pickOne<T extends string>(v: unknown, allowed: readonly T[]): T | null {
  return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : null;
}

/** South African cell numbers only (06, 07, 08): 082 123 4567, +27 82 123 4567 and 27821234567 all become +27821234567. */
export function normalisePhone(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length > 30) return null;
  const digits = raw.replace(/[\s\-().]/g, "");
  const m = /^(?:\+27|0027|27|0)([6-8]\d{8})$/.exec(digits);
  return m ? `+27${m[1]}` : null;
}

export const honeypotFilled = (b: JoinBody) => typeof b.website === "string" && b.website.trim() !== "";
export const submittedTooFast = (b: JoinBody) =>
  !(typeof b.elapsedMs === "number" && Number.isFinite(b.elapsedMs) && b.elapsedMs >= JOIN_MIN_FORM_TIME_MS);

export function validateJoin(b: JoinBody): JoinValidation {
  const fail = (field: string, error: string): JoinValidation => ({ ok: false, field, error });

  const name = clean(b.name, 100);
  if (!name || name.length > 100) return fail("name", "Please enter your full name.");

  const phone = normalisePhone(b.phone);
  if (!phone) return fail("phone", "Please enter a South African cell number starting 06, 07 or 08, for example 082 123 4567. No cell phone? Email info@tshiamisoastronauts.org.");

  const whatsapp = pickOne(b.whatsapp, ["Yes", "No"] as const);
  if (!whatsapp) return fail("whatsapp", "Please tell us if this number is on WhatsApp.");

  const email = clean(b.email, 254).toLowerCase();
  if (email && (email.length > 254 || !EMAIL_RE.test(email))) return fail("email", "Please enter a valid email address, or leave it blank.");

  const area = clean(b.area, 100);
  if (area.length > 100) return fail("area", "Area or suburb is too long.");

  const learnerName = clean(b.learnerName, 100);
  if (!learnerName || learnerName.length > 100) return fail("learnerName", "Please enter the learner's first name and surname.");
  const learnerSchool = clean(b.learnerSchool, 120);
  if (!learnerSchool || learnerSchool.length > 120) return fail("learnerSchool", "Please enter the learner's school.");
  const learnerGrade = pickOne(b.learnerGrade, GRADES);
  if (!learnerGrade) return fail("learnerGrade", "Please choose the learner's grade.");

  const otherChildren = clean(b.otherChildren, 1000, true);
  if (otherChildren.length > 1000) return fail("otherChildren", "That is too long. Please keep it under 1000 characters.");

  if (b.consent !== true) return fail("consent", "Please tick the box so we know you agree.");

  return {
    ok: true,
    value: {
      name,
      phone,
      whatsapp,
      email: email || null,
      area,
      learnerName,
      learnerSchool,
      learnerGrade,
      otherChildren,
      source: cleanSource(typeof b.src === "string" ? b.src : null),
    },
  };
}
