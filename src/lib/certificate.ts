import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, degrees, rgb, type PDFFont, type PDFPage } from "pdf-lib";

// Section 18A donation certificate. Layout follows TA_Script_Section18ACertificateLayout_V1.
export const ORG = {
  name: "Tshiamiso Astronauts NPC",
  registration: "2022/460202/08",
  address: "4206 Kopanong Street, Evaton West, Gauteng",
  pbo: "930083956",
  npo: "294-255",
  email: "info@tshiamisoastronauts.org",
  website: "www.tshiamisoastronauts.org",
  signatory: "Kgomotso Dibetso",
  signatoryRole: "Executive Director",
} as const;

export interface CertificateData {
  receiptNumber: string;
  donorName: string;
  donorEmail: string;
  amount: string; // "250.00"
  date: Date;
  donorAddress?: string;
  donorId?: string;
  /** Adds a SAMPLE watermark. For reviewing the layout only. */
  sample?: boolean;
}

const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const ORANGE = hex("#E9711E");
const TEAL = hex("#0A8A9D");
const DTEAL = hex("#19525E");
const NAVY = hex("#000080");
const LTEAL = hex("#E3F4F6");
const OFFWHITE = hex("#FAFEFE");
const TERRA = hex("#C49587");
const GREY = hex("#4A5A5E");
const WHITE = rgb(1, 1, 1);

const ASSETS = path.join(process.cwd(), "src", "lib", "certificate-assets");
const FONT_FILES = {
  regular: "Poppins-Regular.ttf",
  medium: "Poppins-Medium.ttf",
  bold: "Poppins-Bold.ttf",
  light: "Poppins-Light.ttf",
  italic: "Poppins-Italic.ttf",
} as const;

export const formatCertDate = (d: Date) =>
  new Intl.DateTimeFormat("en-ZA", { timeZone: "Africa/Johannesburg", day: "2-digit", month: "long", year: "numeric" }).format(d);

// "R 1 500.00"
export const formatAmount = (amount: number) =>
  `R ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;

// ── Amount in words ("One thousand five hundred rand only") ─────────────────────
const ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
const TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split(" ");

function below1000(x: number): string {
  const s: string[] = [];
  if (x >= 100) {
    s.push(`${ONES[Math.floor(x / 100)]} hundred`);
    x %= 100;
    if (x) s.push("and");
  }
  if (x >= 20) s.push(TENS[Math.floor(x / 10)] + (x % 10 ? `-${ONES[x % 10]}` : ""));
  else if (x || s.length === 0) s.push(ONES[x]);
  return s.join(" ");
}

function words(n: number): string {
  const out: string[] = [];
  if (n >= 1000) {
    out.push(`${below1000(Math.floor(n / 1000))} thousand`);
    n %= 1000;
    if (n) out.push(n < 100 ? "and" : "");
  }
  if (n || out.length === 0) out.push(below1000(n));
  return out.filter(Boolean).join(" ");
}

export function amountWords(amount: number): string {
  const r = Math.floor(amount);
  const c = Math.round((amount - r) * 100);
  let s = `${words(r)} rand`;
  if (c) s += ` and ${words(c)} cent${c === 1 ? "" : "s"}`;
  return `${s[0].toUpperCase()}${s.slice(1)} only`;
}

// Keep to what the Poppins latin subset can draw; anything else becomes "?".
const safe = (s: string) => s.replace(/[\r\n\t]+/g, " ").replace(/[^ -ÿ–—‘-”•…]/g, "?");

/** Shrinks text to fit `maxWidth`, then trims it with an ellipsis as a last resort. */
function fit(text: string, font: PDFFont, size: number, maxWidth: number): { text: string; size: number } {
  text = safe(text);
  let s = size;
  while (s > 7 && font.widthOfTextAtSize(text, s) > maxWidth) s -= 0.5;
  if (font.widthOfTextAtSize(text, s) > maxWidth) {
    while (text.length > 1 && font.widthOfTextAtSize(`${text}…`, s) > maxWidth) text = text.slice(0, -1);
    text += "…";
  }
  return { text, size: s };
}

/** Rounded rectangle (pdf-lib has none). y is the bottom edge, like reportlab. */
function roundRect(page: PDFPage, x: number, y: number, w: number, h: number, r: number, opts: { fill?: ReturnType<typeof rgb>; stroke?: ReturnType<typeof rgb>; lineWidth?: number }) {
  const d = `M ${r} 0 H ${w - r} Q ${w} 0 ${w} ${r} V ${h - r} Q ${w} ${h} ${w - r} ${h} H ${r} Q 0 ${h} 0 ${h - r} V ${r} Q 0 0 ${r} 0 Z`;
  page.drawSvgPath(d, {
    x,
    y: y + h,
    color: opts.fill,
    borderColor: opts.stroke,
    borderWidth: opts.stroke ? (opts.lineWidth ?? 1) : 0,
  });
}

export async function buildCertificatePdf(c: CertificateData): Promise<Uint8Array> {
  const [regularB, mediumB, boldB, lightB, italicB, logoB] = await Promise.all([
    readFile(path.join(ASSETS, FONT_FILES.regular)),
    readFile(path.join(ASSETS, FONT_FILES.medium)),
    readFile(path.join(ASSETS, FONT_FILES.bold)),
    readFile(path.join(ASSETS, FONT_FILES.light)),
    readFile(path.join(ASSETS, FONT_FILES.italic)),
    readFile(path.join(ASSETS, "ta-logo.png")),
  ]);

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`Section 18A Certificate ${c.receiptNumber}`);
  pdf.setAuthor(ORG.name);
  pdf.setSubject("Section 18A donation certificate");

  const regular = await pdf.embedFont(regularB);
  const medium = await pdf.embedFont(mediumB);
  const bold = await pdf.embedFont(boldB);
  const light = await pdf.embedFont(lightB);
  const italic = await pdf.embedFont(italicB);
  const logo = await pdf.embedPng(logoB);

  const W = 595.28;
  const H = 841.89;
  const page = pdf.addPage([W, H]);

  const text = (t: string, x: number, y: number, font: PDFFont, size: number, color: ReturnType<typeof rgb>) =>
    page.drawText(safe(t), { x, y, font, size, color });
  const textRight = (t: string, x: number, y: number, font: PDFFont, size: number, color: ReturnType<typeof rgb>) =>
    page.drawText(safe(t), { x: x - font.widthOfTextAtSize(safe(t), size), y, font, size, color });
  const rect = (x: number, y: number, w: number, h: number, color: ReturnType<typeof rgb>) =>
    page.drawRectangle({ x, y, width: w, height: h, color });

  // background + frame
  rect(0, 0, W, H, OFFWHITE);
  rect(0, H - 14, W, 14, DTEAL);
  rect(0, H - 18, W, 4, ORANGE);
  const m = 36;
  roundRect(page, m, 78, W - 2 * m, H - 78 - 40, 8, { stroke: TEAL, lineWidth: 1 });

  // header: logo + receipt number
  const lw = 170;
  const lh = (lw * 354) / 1010;
  page.drawImage(logo, { x: m + 22, y: H - 40 - 22 - lh, width: lw, height: lh });
  const rx = W - m - 22;
  textRight("CERTIFICATE NUMBER", rx, H - 66, medium, 7.5, GREY);
  textRight(c.receiptNumber, rx, H - 86, bold, 17, DTEAL);
  textRight("DATE OF RECEIPT", rx, H - 104, medium, 7.5, GREY);
  textRight(formatCertDate(c.date), rx, H - 118, medium, 11, DTEAL);

  // title
  let y = H - 192;
  rect(m + 22, y + 44, 38, 3, ORANGE);
  text("Section 18A Donation Certificate", m + 22, y + 14, bold, 25, DTEAL);
  text("Issued in terms of section 18A of the Income Tax Act, 1962 (Act No. 58 of 1962)", m + 22, y - 2, light, 9, GREY);

  // thank-you band
  y -= 22;
  roundRect(page, m + 22, y - 62, W - 2 * m - 44, 62, 6, { fill: LTEAL });
  rect(m + 22, y - 62, 4, 62, TEAL);
  text("Thank you for your donation.", m + 38, y - 22, medium, 11, DTEAL);
  text("Your generosity helps build a literate, empowered and confident community in", m + 38, y - 38, regular, 8.8, GREY);
  text("Evaton West through reading, education and digital skills.", m + 38, y - 51, regular, 8.8, GREY);

  // donor + donation details
  y -= 96;
  const valueX = m + 190;
  const valueMax = W - m - 22 - valueX;
  const row = (label: string, value: string, yy: number, isBold = false, size = 10.5) => {
    text(label.toUpperCase(), m + 22, yy, medium, 7.5, GREY);
    const f = fit(value, isBold ? bold : regular, size, valueMax);
    text(f.text, valueX, yy - 1, isBold ? bold : regular, f.size, isBold ? NAVY : DTEAL);
    page.drawLine({ start: { x: m + 22, y: yy - 10 }, end: { x: W - m - 22, y: yy - 10 }, thickness: 0.6, color: hex("#CFE6EA") });
  };
  text("DONOR AND DONATION", m + 22, y + 6, bold, 9, DTEAL);
  y -= 22;
  const amount = Number(c.amount);
  row("Donor name", c.donorName, y, true); y -= 29;
  row("Donor email", c.donorEmail, y); y -= 29;
  row("Donor address", c.donorAddress || "Not provided", y); y -= 29;
  row("ID / tax reference", c.donorId || "Not provided", y); y -= 29;
  row("Nature of donation", "Cash (monetary donation)", y); y -= 29;
  row("Amount donated", formatAmount(amount), y, true, 14); y -= 20;
  text(amountWords(amount), valueX, y - 1, italic, 8.5, GREY); y -= 14;

  // statement
  y -= 14;
  text("SECTION 18A STATEMENT", m + 22, y, bold, 9, DTEAL);
  y -= 15;
  for (const ln of [
    "This receipt is issued for the purposes of section 18A of the Income Tax Act, 1962.",
    "Tshiamiso Astronauts NPC is a public benefit organisation approved by the South African",
    "Revenue Service (SARS) in terms of section 30 of the Income Tax Act, 1962, and is",
    "authorised to issue receipts for donations that qualify under section 18A.",
    "No goods, services or other benefit were provided to the donor in return for this donation.",
    "Please keep this certificate for your tax records.",
  ]) {
    text(ln, m + 22, y, regular, 8.6, GREY);
    y -= 12.5;
  }

  // org block + signature
  y -= 10;
  const top = y;
  text("ISSUED BY", m + 22, top, bold, 9, DTEAL);
  text(ORG.name, m + 22, top - 16, medium, 9.5, DTEAL);
  let yy = top - 30;
  for (const ln of [
    `Registration No. ${ORG.registration}`,
    `NPO No. ${ORG.npo}`,
    `PBO / Section 18A Ref. ${ORG.pbo}`,
    ORG.address,
    ORG.email,
    ORG.website,
  ]) {
    text(ln, m + 22, yy, regular, 8.4, GREY);
    yy -= 11.5;
  }
  const sx = W / 2 + 25;
  page.drawLine({ start: { x: sx, y: top - 40 }, end: { x: W - m - 22, y: top - 40 }, thickness: 0.8, color: DTEAL });
  text(ORG.signatory, sx, top - 54, bold, 9.5, DTEAL);
  text(ORG.signatoryRole, sx, top - 66, regular, 8.4, GREY);
  text("Authorised signatory", sx, top - 78, regular, 8.4, GREY);

  // footer band
  rect(0, 0, W, 62, DTEAL);
  rect(0, 62, W, 3, ORANGE);
  let x = m;
  for (const [t, color] of [["Read", WHITE], ["  •  ", ORANGE], ["Grow", WHITE], ["  •  ", ORANGE], ["Thrive", TERRA]] as const) {
    text(t, x, 36, bold, 11, color);
    x += bold.widthOfTextAtSize(t, 11);
  }
  text("Innovation  |  Nurturing  |  Solidarity  |  Professionalism  |  Integrity  |  Respect  |  Empowerment", m, 20, regular, 7.5, hex("#BFE3E8"));
  textRight("#Breakthrough2026", W - m, 36, medium, 8, WHITE);
  textRight(`Certificate ${c.receiptNumber}`, W - m, 20, regular, 7.5, WHITE);

  if (c.sample) {
    const size = 120;
    const label = "SAMPLE";
    const angle = (35 * Math.PI) / 180;
    const half = bold.widthOfTextAtSize(label, size) / 2;
    page.drawText(label, {
      x: W / 2 - half * Math.cos(angle),
      y: H / 2 - 40 - half * Math.sin(angle),
      font: bold,
      size,
      color: TERRA,
      opacity: 0.16,
      rotate: degrees(35),
    });
  }

  return pdf.save();
}
