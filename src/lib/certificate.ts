import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

// Section 18A donation certificate. Organisation details come from the website footer.
export const ORG = {
  name: "Tshiamiso Astronauts NPC",
  address: "4206 Kopanong Street, Evaton West, Gauteng, South Africa",
  pbo: "930083956",
  npo: "294-255",
  email: "info@tshiamisoastronauts.org",
  website: "www.tshiamisoastronauts.org",
} as const;

export interface CertificateData {
  receiptNumber: string;
  donorName: string;
  donorEmail: string;
  amount: string; // "250.00"
  date: Date;
  recurring: boolean;
}

// The statement SARS expects on a section 18A receipt.
export const STATEMENT =
  "This receipt is issued for the purposes of section 18A of the Income Tax Act, 1962 (Act No. 58 of 1962). " +
  "The donation will be used exclusively for the public benefit activities of the organisation.";

export const formatCertDate = (d: Date) =>
  new Intl.DateTimeFormat("en-ZA", { timeZone: "Africa/Johannesburg", day: "2-digit", month: "long", year: "numeric" }).format(d);

// "R1 250.00": a point for cents, matching the amounts shown in our emails.
export const formatAmount = (amount: string) => `R${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;

// Standard PDF fonts only cover Latin-1, so accents are stripped and anything else becomes "?".
const latin = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\x20-\x7e\xa0-\xff]/g, "?");

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export async function buildCertificatePdf(c: CertificateData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0x1c / 255, 0x2e / 255, 0x4a / 255);
  const teal = rgb(0x0b / 255, 0x84 / 255, 0x8c / 255);
  const grey = rgb(0.4, 0.4, 0.4);
  const { width } = page.getSize();
  const left = 56;
  const right = width - 56;

  // Header band
  page.drawRectangle({ x: 0, y: 741, width, height: 101, color: navy });
  page.drawText(latin(ORG.name), { x: left, y: 796, size: 22, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Literacy and community empowerment | Evaton West, Gauteng", { x: left, y: 774, size: 10, font: regular, color: rgb(0.85, 0.92, 0.93) });

  page.drawText("SECTION 18A DONATION CERTIFICATE", { x: left, y: 700, size: 17, font: bold, color: teal });
  page.drawLine({ start: { x: left, y: 690 }, end: { x: right, y: 690 }, thickness: 1.5, color: teal });

  const rows: [string, string][] = [
    ["Receipt number", c.receiptNumber],
    ["Date of donation", formatCertDate(c.date)],
    ["Donor", c.donorName],
    ["Donor email", c.donorEmail],
    ["Nature of donation", c.recurring ? "Cash (monthly recurring donation, this payment)" : "Cash (once-off donation)"],
    ["Amount received", formatAmount(c.amount)],
  ];
  let y = 660;
  for (const [label, value] of rows) {
    page.drawText(latin(label), { x: left, y, size: 10, font: regular, color: grey });
    const isAmount = label === "Amount received";
    page.drawText(latin(value), { x: left + 150, y, size: isAmount ? 14 : 11, font: bold, color: navy });
    y -= isAmount ? 34 : 28;
  }

  y -= 6;
  page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
  y -= 26;
  page.drawText("Issued by", { x: left, y, size: 10, font: regular, color: grey });
  y -= 18;
  for (const [text, f] of [
    [ORG.name, bold],
    [ORG.address, regular],
    [`Public Benefit Organisation (PBO) number: ${ORG.pbo}`, regular],
    [`NPO number: ${ORG.npo}`, regular],
    [`${ORG.email} | ${ORG.website}`, regular],
  ] as [string, PDFFont][]) {
    page.drawText(latin(text), { x: left, y, size: 11, font: f, color: navy });
    y -= 17;
  }

  y -= 14;
  for (const line of wrap(STATEMENT, regular, 10, right - left)) {
    page.drawText(line, { x: left, y, size: 10, font: regular, color: navy });
    y -= 15;
  }

  y -= 14;
  for (const line of wrap(
    "Please keep this certificate for your records. You will need it to claim your tax deduction when you submit your income tax return to SARS.",
    regular, 9, right - left,
  )) {
    page.drawText(line, { x: left, y, size: 9, font: regular, color: grey });
    y -= 13;
  }

  page.drawText("This certificate was issued electronically and is valid without a signature.", { x: left, y: 56, size: 8, font: regular, color: grey });

  return pdf.save();
}
