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
