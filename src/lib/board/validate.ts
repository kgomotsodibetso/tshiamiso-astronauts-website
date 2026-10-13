// Small, dependency-free checks shared by the Board forms (browser and server).
// Never log or return the values being checked: they are candidate details.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function clean(value: FormDataEntryValue | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_RE.test(value);
}

export function wordCount(value: string): number {
  const t = value.trim();
  return t ? t.split(/\s+/).length : 0;
}

// South African cell numbers only: 082 123 4567, +27 82 123 4567 or 27821234567 all become +27821234567.
// Monday's phone column rejects numbers it cannot place, so anything else is turned away with a clear message.
export function normaliseSaPhone(value: string): string | null {
  const digits = value.replace(/[\s\-().]/g, "");
  let m = /^0([1-9]\d{8})$/.exec(digits);
  if (m) return `+27${m[1]}`;
  m = /^\+?27([1-9]\d{8})$/.exec(digits);
  return m ? `+27${m[1]}` : null;
}

// LinkedIn link: https only, on linkedin.com. Returns the cleaned URL, or null if it is not acceptable.
export function normaliseLinkedIn(value: string): string | null {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (host !== "linkedin.com" && !host.endsWith(".linkedin.com")) return null;
    url.protocol = "https:";
    return url.toString().slice(0, 300);
  } catch {
    return null;
  }
}

// CV check: extension, size and the file's own first bytes must agree, so a renamed program is turned away.
const CV_RULES: Record<string, number[][]> = {
  pdf: [[0x25, 0x50, 0x44, 0x46]],
  doc: [[0xd0, 0xcf, 0x11, 0xe0]],
  docx: [[0x50, 0x4b, 0x03, 0x04]],
};

export async function checkCv(file: File | null, maxBytes: number): Promise<string | null> {
  if (!file || file.size === 0) return "Please upload your CV.";
  if (file.size > maxBytes) return `Your CV must be smaller than ${Math.round(maxBytes / (1024 * 1024))} MB.`;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const magic = CV_RULES[ext];
  if (!magic) return "Please upload your CV as a PDF, DOC or DOCX file.";
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (!magic.some((m) => m.every((b, i) => head[i] === b))) return "Your CV does not look like a valid PDF or Word file.";
  return null;
}

export const safeFileName = (name: string) => name.replace(/[^\w.\- ]+/g, "_").slice(-100) || "cv";
