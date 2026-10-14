import { Resend, type CreateEmailOptions } from "resend";

// If API key is missing, it will throw an error when used, which is fine as it's caught in Server Actions.
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key_to_prevent_crash_during_build");

// Everything a visitor types is escaped before it goes into an email, so nobody can inject links,
// images or fake content into mail that comes from our own address.
const esc = (v: unknown): string =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const escMultiline = (v: unknown): string => esc(v).replace(/\r?\n/g, "<br/>");
// Subject lines must stay on one line.
const oneLine = (v: unknown, max = 120): string => String(v ?? "").replace(/[\r\n\t]+/g, " ").trim().slice(0, max);

const FROM_EMAIL = "Tshiamiso Astronauts <no-reply@tshiamisoastronauts.org>";
const ADMIN_EMAIL = "info@tshiamisoastronauts.org";

async function sendEmailSafely(options: CreateEmailOptions) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "dummy_key_to_prevent_crash_during_build") {
    console.warn("[Resend] Skipping email: RESEND_API_KEY is not set.");
    return;
  }
  try {
    const { data, error } = await resend.emails.send(options);
    if (error) {
      console.error("[Resend] Failed to send email:", error);
    } else {
      console.log(`[Resend] Email sent successfully to ${options.to} (ID: ${data?.id})`);
    }
    return { data, error };
  } catch (err) {
    console.error("[Resend] Unexpected error sending email:", err);
    return { error: err };
  }
}

// ── Contact Us Templates ──────────────────────────────────────────────────

export const sendContactConfirmation = async (email: string, firstName: string) => {
  return sendEmailSafely({
    from: FROM_EMAIL,
    to: email,
    subject: "We've received your message! | Tshiamiso Astronauts",
    html: `
      <div style="font-family: sans-serif; color: #1c2e4a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0b848c;">Hi ${esc(firstName)},</h2>
        <p>Thank you for reaching out to Tshiamiso Astronauts! We've successfully received your message.</p>
        <p>Our team is reviewing your inquiry and will get back to you within 1–2 working days.</p>
        <br/>
        <p>Warm regards,</p>
        <p><strong>The Tshiamiso Astronauts Team</strong></p>
      </div>
    `,
  });
};

export const sendContactNotification = async (input: { firstName: string; lastName: string; email: string; phone: string; subject: string; message: string }) => {
  return sendEmailSafely({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Contact Form Submission: ${oneLine(input.subject)}`,
    html: `
      <div style="font-family: sans-serif; color: #1c2e4a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff6b35;">New Contact Us Submission</h2>
        <p><strong>Name:</strong> ${esc(input.firstName)} ${esc(input.lastName)}</p>
        <p><strong>Email:</strong> ${esc(input.email)}</p>
        <p><strong>Phone:</strong> ${esc(input.phone || "N/A")}</p>
        <p><strong>Subject:</strong> ${esc(input.subject)}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 4px solid #0b848c; margin-left: 0; padding-left: 10px; color: #555;">
          ${escMultiline(input.message)}
        </blockquote>
      </div>
    `,
  });
};

// ── Volunteer Templates ───────────────────────────────────────────────────

export const sendVolunteerConfirmation = async (email: string, firstName: string) => {
  return sendEmailSafely({
    from: FROM_EMAIL,
    to: email,
    subject: "Thank you for applying to volunteer! | Tshiamiso Astronauts",
    html: `
      <div style="font-family: sans-serif; color: #1c2e4a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0b848c;">Hi ${esc(firstName)},</h2>
        <p>Thank you for offering your time and skills to Tshiamiso Astronauts!</p>
        <p>We've received your volunteer application and our team will review your details. We will be in touch within 3–5 working days to discuss the next steps.</p>
        <br/>
        <p>Warm regards,</p>
        <p><strong>The Tshiamiso Astronauts Team</strong></p>
      </div>
    `,
  });
};

export const sendVolunteerNotification = async (input: { firstName: string; lastName: string; email: string; role: string }) => {
  return sendEmailSafely({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Volunteer Application: ${oneLine(`${input.firstName} ${input.lastName}`)}`,
    html: `
      <div style="font-family: sans-serif; color: #1c2e4a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff6b35;">New Volunteer Application</h2>
        <p><strong>Name:</strong> ${esc(input.firstName)} ${esc(input.lastName)}</p>
        <p><strong>Email:</strong> ${esc(input.email)}</p>
        <p><strong>Role applied for:</strong> ${esc(input.role)}</p>
        <p>The full application details and files (CV, Qualifications) have been saved to the Monday.com Volunteer board.</p>
      </div>
    `,
  });
};

// ── Family sign-up (/join) ────────────────────────────────────────────────

// Staff alert. Kept to what is needed to start the follow-up call. Learner names, schools and notes stay on
// the private monday board; the link below opens the full row there.
export const sendFamilySignupNotification = async (input: {
  parentName: string;
  phone: string;
  whatsapp: string;
  source: string;
  callDue: string;
  itemUrl: string;
}) => {
  return sendEmailSafely({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New family sign-up: ${oneLine(input.parentName, 80)}`,
    html: `
      <div style="font-family: sans-serif; color: #1c2e4a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff6b35;">New family sign-up</h2>
        <p><strong>Call by:</strong> ${esc(input.callDue)} (within 7 days)</p>
        <p><strong>Parent or guardian:</strong> ${esc(input.parentName)}</p>
        <p><strong>Cell number:</strong> ${esc(input.phone)} (on WhatsApp: ${esc(input.whatsapp)})</p>
        <p><strong>Programme:</strong> Homework Assistance</p>
        <p><strong>Link source:</strong> ${esc(input.source)}</p>
        <p><a href="${esc(input.itemUrl)}" style="display: inline-block; background: #0A8A9D; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold;">Open the full row on monday.com</a></p>
        <p style="font-size: 13px; color: #555;">Details are on the private Family Interest board. Please do not forward this email.</p>
      </div>
    `,
  });
};

// ── Donor Templates ───────────────────────────────────────────────────────

export interface CertificateEmail {
  receiptNumber: string;
  pdf: Uint8Array;
}

const certAttachment = (c: CertificateEmail) => ({
  filename: `TA_18A_Certificate_${c.receiptNumber}.pdf`,
  content: Buffer.from(c.pdf),
});

export const sendDonorReceipt = async (email: string, firstName: string, amount: string, cert?: CertificateEmail) => {
  return sendEmailSafely({
    from: FROM_EMAIL,
    to: email,
    subject: "Thank you for your donation! | Tshiamiso Astronauts",
    ...(cert ? { attachments: [certAttachment(cert)] } : {}),
    html: `
      <div style="font-family: sans-serif; color: #1c2e4a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0b848c;">Hi ${esc(firstName)},</h2>
        <p>Thank you so much for your generous donation of <strong>R${esc(amount)}</strong> to Tshiamiso Astronauts.</p>
        <p>Your support directly funds books, tutors, and digital access for learners in Evaton West.</p>
        ${
          cert
            ? `<p>Your <strong>Section 18A tax certificate</strong> (no. ${esc(cert.receiptNumber)}) is attached to this email as a PDF. Please keep it for your tax return.</p>`
            : `<p>We will email your <strong>Section 18A tax certificate</strong> shortly. If you do not receive it within 48 hours, please contact info@tshiamisoastronauts.org.</p>`
        }
        <br/>
        <p>Warm regards,</p>
        <p><strong>The Tshiamiso Astronauts Team</strong></p>
      </div>
    `,
  });
};

export const sendDonorNotification = async (
  firstName: string,
  lastName: string,
  email: string,
  amount: string,
  cert?: CertificateEmail,
  registerSaved?: boolean,
) => {
  return sendEmailSafely({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Donation Received: R${oneLine(amount, 20)}`,
    ...(cert ? { attachments: [certAttachment(cert)] } : {}),
    html: `
      <div style="font-family: sans-serif; color: #1c2e4a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff6b35;">New Donation Received!</h2>
        <p><strong>Donor:</strong> ${esc(firstName)} ${esc(lastName)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Amount:</strong> R${esc(amount)}</p>
        <p>The donation has been successfully processed via PayFast.</p>
        ${
          cert
            ? `<p><strong>Section 18A certificate ${esc(cert.receiptNumber)}</strong> was emailed to the donor automatically. A copy is attached for the records.</p>`
            : `<p><strong style="color:#b3261e;">No Section 18A certificate was sent automatically.</strong> Please issue one manually.</p>`
        }
        ${
          registerSaved === undefined
            ? ""
            : registerSaved
              ? `<p>Saved to the Monday.com Donations Register.</p>`
              : `<p><strong style="color:#b3261e;">Not saved to the Monday.com Donations Register.</strong> Please add this donation to the register by hand.</p>`
        }
      </div>
    `,
  });
};

// ── Board recruitment ─────────────────────────────────────────────

/**
 * One email to a nominee, sent when someone nominates them on /board/nominate.
 * `applyUrl` is built by the server (never taken from the request). Returns true only if Resend accepted it.
 */
export const sendBoardNomineeInvitation = async (input: { nomineeName: string; nominatorName: string; email: string; applyUrl: string; boardUrl: string; privacyUrl: string }): Promise<boolean> => {
  const nominee = oneLine(input.nomineeName, 150);
  const nominator = oneLine(input.nominatorName, 150);
  const info = "info@tshiamisoastronauts.org";
  const result = await sendEmailSafely({
    from: FROM_EMAIL,
    replyTo: ADMIN_EMAIL,
    to: input.email,
    subject: "You have been nominated for the Tshiamiso Astronauts Board",
    html: `
      <div style="font-family: Montserrat, Arial, sans-serif; color: #000080; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.55;">
        <p>Hello ${esc(nominee)},</p>
        <p>${esc(nominator)} has nominated you to join the Board of Directors of Tshiamiso Astronauts (TA). We are a literacy and community-empowerment non-profit in Evaton West, Gauteng, and we are opening seats on our Board for 2026, our Year of Breakthrough.</p>
        <p>We are looking for people who will guide a literate, empowered and confident Evaton West. A nomination is an invitation to apply. Nobody is appointed on a nomination alone.</p>
        <p style="margin-bottom: 4px;"><strong>What the role involves</strong></p>
        <ul style="margin-top: 0;">
          <li>One Saturday a month: Board meeting, 15h00 to 17h00, plus committee work.</li>
          <li>A 5-year term.</li>
          <li>Unpaid, with real impact for children and families in our community.</li>
        </ul>
        <p style="margin-bottom: 4px;"><strong>If you are interested</strong></p>
        <p style="margin-top: 0;">Apply by Friday 27 November 2026. It takes about 10 minutes and you will need your CV (PDF or Word).</p>
        <p style="margin: 24px 0;"><a href="${esc(input.applyUrl)}" style="background-color: #E9711E; color: #000080; font-weight: bold; text-decoration: none; padding: 14px 28px; border-radius: 6px; display: inline-block;">Apply now</a></p>
        <p>You can read more about the role at <a href="${esc(input.boardUrl)}" style="color: #000080;">${esc(input.boardUrl.replace(/^https?:\/\//, ""))}</a>.</p>
        <p style="margin-bottom: 4px;"><strong>If you are not interested</strong></p>
        <p style="margin-top: 0;">You do not need to do anything.</p>
        <p style="margin-bottom: 4px;"><strong>Your details</strong></p>
        <p style="margin-top: 0;">${esc(nominator)} gave us your name and contact details. We use them only to send you this invitation. If you do not apply, we will delete them after the recruitment closes on 27 November 2026. To ask what we hold, or to have your details deleted sooner, reply to this email or write to <a href="mailto:${info}" style="color: #000080;">${info}</a>. Our Privacy Policy is at <a href="${esc(input.privacyUrl)}" style="color: #000080;">${esc(input.privacyUrl.replace(/^https?:\/\//, ""))}</a>.</p>
        <p>If this reached you by mistake, please tell us at <a href="mailto:${info}" style="color: #000080;">${info}</a>.</p>
        <p>Warm regards,<br/><strong>The Tshiamiso Astronauts Team</strong></p>
        <hr style="border: 0; border-top: 1px solid #ccc; margin: 24px 0 12px;"/>
        <p style="font-size: 12px; color: #333;">Tshiamiso Astronauts NPC | NPC 2022/460202/08 | NPO 294-255 | PBO 930083956</p>
      </div>
    `,
    text: [
      `Hello ${nominee},`,
      "",
      `${nominator} has nominated you to join the Board of Directors of Tshiamiso Astronauts (TA). We are a literacy and community-empowerment non-profit in Evaton West, Gauteng, and we are opening seats on our Board for 2026, our Year of Breakthrough.`,
      "",
      "We are looking for people who will guide a literate, empowered and confident Evaton West. A nomination is an invitation to apply. Nobody is appointed on a nomination alone.",
      "",
      "What the role involves",
      "- One Saturday a month: Board meeting, 15h00 to 17h00, plus committee work.",
      "- A 5-year term.",
      "- Unpaid, with real impact for children and families in our community.",
      "",
      "If you are interested",
      "Apply by Friday 27 November 2026. It takes about 10 minutes and you will need your CV (PDF or Word).",
      `Apply now: ${input.applyUrl}`,
      "",
      `You can read more about the role at ${input.boardUrl}.`,
      "",
      "If you are not interested",
      "You do not need to do anything.",
      "",
      "Your details",
      `${nominator} gave us your name and contact details. We use them only to send you this invitation. If you do not apply, we will delete them after the recruitment closes on 27 November 2026. To ask what we hold, or to have your details deleted sooner, reply to this email or write to ${info}. Our Privacy Policy is at ${input.privacyUrl}.`,
      "",
      `If this reached you by mistake, please tell us at ${info}.`,
      "",
      "Warm regards,",
      "The Tshiamiso Astronauts Team",
      "",
      "Tshiamiso Astronauts NPC | NPC 2022/460202/08 | NPO 294-255 | PBO 930083956",
    ].join("\n"),
  });
  return Boolean(result && "data" in result && result.data?.id);
};

// Shared look for the Board emails below (brand navy text, orange button, credentials line).
const boardShell = (inner: string) => `
  <div style="font-family: Montserrat, Arial, sans-serif; color: #000080; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.55;">
    ${inner}
    <p>Warm regards,<br/><strong>The Tshiamiso Astronauts Team</strong></p>
    <hr style="border: 0; border-top: 1px solid #ccc; margin: 24px 0 12px;"/>
    <p style="font-size: 12px; color: #333;">Tshiamiso Astronauts NPC | NPC 2022/460202/08 | NPO 294-255 | PBO 930083956</p>
  </div>`;
const CREDENTIALS = "Tshiamiso Astronauts NPC | NPC 2022/460202/08 | NPO 294-255 | PBO 930083956";
const accepted = (r: Awaited<ReturnType<typeof sendEmailSafely>>): boolean => Boolean(r && "data" in r && r.data?.id);

/** Confirmation to someone who has just applied for the Board. Returns true only if Resend accepted it. */
export const sendBoardApplicationConfirmation = async (input: { name: string; email: string; cvSaved: boolean; privacyUrl: string }): Promise<boolean> => {
  const name = oneLine(input.name, 150);
  const info = "info@tshiamisoastronauts.org";
  const cvHtml = input.cvSaved
    ? ""
    : `<p style="border-left: 4px solid #E9711E; padding-left: 12px;"><strong>Your CV did not upload.</strong> Your application was saved, but please reply to this email with your CV attached.</p>`;
  const cvText = input.cvSaved ? [] : ["Your CV did not upload. Your application was saved, but please reply to this email with your CV attached.", ""];
  return accepted(
    await sendEmailSafely({
      from: FROM_EMAIL,
      replyTo: ADMIN_EMAIL,
      to: input.email,
      subject: "We have received your Board application",
      html: boardShell(`
        <p>Hello ${esc(name)},</p>
        <p>Thank you for applying to join the Board of Directors of Tshiamiso Astronauts. We have received your application.</p>
        ${cvHtml}
        <p style="margin-bottom: 4px;"><strong>What happens next</strong></p>
        <ol style="margin-top: 0;">
          <li>A committee screens applications in early December.</li>
          <li>Shortlisted candidates are interviewed.</li>
          <li>Appointments are confirmed at a meeting of our members in the new year.</li>
        </ol>
        <p>We will contact you by email. If anything in your application changes, or you want to withdraw, reply to this email or write to <a href="mailto:${info}" style="color: #000080;">${info}</a>.</p>
        <p style="margin-bottom: 4px;"><strong>Your details</strong></p>
        <p style="margin-top: 0;">We use your details only for this recruitment, in line with POPIA. Our Privacy Policy is at <a href="${esc(input.privacyUrl)}" style="color: #000080;">${esc(input.privacyUrl.replace(/^https?:\/\//, ""))}</a>.</p>`),
      text: [
        `Hello ${name},`,
        "",
        "Thank you for applying to join the Board of Directors of Tshiamiso Astronauts. We have received your application.",
        "",
        ...cvText,
        "What happens next",
        "1. A committee screens applications in early December.",
        "2. Shortlisted candidates are interviewed.",
        "3. Appointments are confirmed at a meeting of our members in the new year.",
        "",
        `We will contact you by email. If anything in your application changes, or you want to withdraw, reply to this email or write to ${info}.`,
        "",
        "Your details",
        `We use your details only for this recruitment, in line with POPIA. Our Privacy Policy is at ${input.privacyUrl}.`,
        "",
        "Warm regards,",
        "The Tshiamiso Astronauts Team",
        "",
        CREDENTIALS,
      ].join("\n"),
    }),
  );
};

/** Confirmation to someone who has just nominated a candidate. */
export const sendBoardNominationConfirmation = async (input: { nominatorName: string; nomineeName: string; email: string; nomineeInvited: boolean; privacyUrl: string }): Promise<boolean> => {
  const nominator = oneLine(input.nominatorName, 150);
  const nominee = oneLine(input.nomineeName, 150);
  const info = "info@tshiamisoastronauts.org";
  const invitedHtml = input.nomineeInvited
    ? `We have emailed ${esc(nominee)} an invitation to apply by Friday 27 November 2026.`
    : `We will invite ${esc(nominee)} to apply by Friday 27 November 2026.`;
  const invitedText = input.nomineeInvited
    ? `We have emailed ${nominee} an invitation to apply by Friday 27 November 2026.`
    : `We will invite ${nominee} to apply by Friday 27 November 2026.`;
  return accepted(
    await sendEmailSafely({
      from: FROM_EMAIL,
      replyTo: ADMIN_EMAIL,
      to: input.email,
      subject: "We have received your Board nomination",
      html: boardShell(`
        <p>Hello ${esc(nominator)},</p>
        <p>Thank you for nominating ${esc(nominee)} for the Board of Directors of Tshiamiso Astronauts. We have received your nomination.</p>
        <p>${invitedHtml} A nomination is an invitation to apply. Nobody is appointed on a nomination alone.</p>
        <p style="margin-bottom: 4px;"><strong>Your details and your nominee's</strong></p>
        <p style="margin-top: 0;">We use your details and ${esc(nominee)}'s only for this recruitment, in line with POPIA. If ${esc(nominee)} does not apply, we will delete their details after the recruitment closes on 27 November 2026. Our Privacy Policy is at <a href="${esc(input.privacyUrl)}" style="color: #000080;">${esc(input.privacyUrl.replace(/^https?:\/\//, ""))}</a>. Questions? Write to <a href="mailto:${info}" style="color: #000080;">${info}</a>.</p>`),
      text: [
        `Hello ${nominator},`,
        "",
        `Thank you for nominating ${nominee} for the Board of Directors of Tshiamiso Astronauts. We have received your nomination.`,
        "",
        `${invitedText} A nomination is an invitation to apply. Nobody is appointed on a nomination alone.`,
        "",
        "Your details and your nominee's",
        `We use your details and ${nominee}'s only for this recruitment, in line with POPIA. If ${nominee} does not apply, we will delete their details after the recruitment closes on 27 November 2026. Our Privacy Policy is at ${input.privacyUrl}. Questions? Write to ${info}.`,
        "",
        "Warm regards,",
        "The Tshiamiso Astronauts Team",
        "",
        CREDENTIALS,
      ].join("\n"),
    }),
  );
};

/**
 * Heads-up to info@ that something arrived. Only the facts needed to act, plus a link to the Monday item:
 * no answers, email addresses or phone numbers.
 */
export const sendBoardStaffNotification = async (input: { kind: "application" | "nomination"; lines: [string, string][]; itemUrl: string }): Promise<boolean> => {
  const title = input.kind === "application" ? "New Board application" : "New Board nomination";
  const subjectName = oneLine(input.lines[0]?.[1] ?? "", 80);
  const rows = input.lines.map(([k, v]) => `<tr><td style="padding: 4px 16px 4px 0; font-weight: bold; vertical-align: top;">${esc(k)}</td><td style="padding: 4px 0;">${esc(oneLine(v, 200))}</td></tr>`).join("");
  return accepted(
    await sendEmailSafely({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `${title}: ${subjectName}`,
      html: `
        <div style="font-family: Montserrat, Arial, sans-serif; color: #000080; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.55;">
          <h2 style="color: #000080; margin-top: 0;">${esc(title)}</h2>
          <table style="border-collapse: collapse;">${rows}</table>
          <p style="margin-top: 20px;"><a href="${esc(input.itemUrl)}" style="background-color: #E9711E; color: #000080; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">Open in Monday</a></p>
          <p style="font-size: 12px; color: #333;">Full details are on the board. They are not included in this email.</p>
        </div>`,
      text: [title, "", ...input.lines.map(([k, v]) => `${k}: ${oneLine(v, 200)}`), "", `Open in Monday: ${input.itemUrl}`, "", "Full details are on the board. They are not included in this email."].join("\n"),
    }),
  );
};
