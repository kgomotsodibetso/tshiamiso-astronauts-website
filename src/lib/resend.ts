import { Resend } from "resend";

// If API key is missing, it will throw an error when used, which is fine as it's caught in Server Actions.
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key_to_prevent_crash_during_build");

const FROM_EMAIL = "Tshiamiso Astronauts <no-reply@tshiamisoastronauts.org>";
const ADMIN_EMAIL = "info@tshiamisoastronauts.org";

// ── Contact Us Templates ──────────────────────────────────────────────────

export const sendContactConfirmation = async (email: string, firstName: string) => {
  if (!process.env.RESEND_API_KEY) return;
  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "We've received your message! | Tshiamiso Astronauts",
    html: `
      <div style="font-family: sans-serif; color: #1c2e4a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0b848c;">Hi ${firstName},</h2>
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
  if (!process.env.RESEND_API_KEY) return;
  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Contact Form Submission: ${input.subject}`,
    html: `
      <div style="font-family: sans-serif; color: #1c2e4a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff6b35;">New Contact Us Submission</h2>
        <p><strong>Name:</strong> ${input.firstName} ${input.lastName}</p>
        <p><strong>Email:</strong> ${input.email}</p>
        <p><strong>Phone:</strong> ${input.phone || "N/A"}</p>
        <p><strong>Subject:</strong> ${input.subject}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 4px solid #0b848c; margin-left: 0; padding-left: 10px; color: #555;">
          ${input.message}
        </blockquote>
      </div>
    `,
  });
};

// ── Volunteer Templates ───────────────────────────────────────────────────

export const sendVolunteerConfirmation = async (email: string, firstName: string) => {
  if (!process.env.RESEND_API_KEY) return;
  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Thank you for applying to volunteer! | Tshiamiso Astronauts",
    html: `
      <div style="font-family: sans-serif; color: #1c2e4a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0b848c;">Hi ${firstName},</h2>
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
  if (!process.env.RESEND_API_KEY) return;
  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Volunteer Application: ${input.firstName} ${input.lastName}`,
    html: `
      <div style="font-family: sans-serif; color: #1c2e4a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff6b35;">New Volunteer Application</h2>
        <p><strong>Name:</strong> ${input.firstName} ${input.lastName}</p>
        <p><strong>Email:</strong> ${input.email}</p>
        <p><strong>Role applied for:</strong> ${input.role}</p>
        <p>The full application details and files (CV, Qualifications) have been saved to the Monday.com Volunteer board.</p>
      </div>
    `,
  });
};

// ── Donor Templates ───────────────────────────────────────────────────────

export const sendDonorReceipt = async (email: string, firstName: string, amount: string) => {
  if (!process.env.RESEND_API_KEY) return;
  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Thank you for your donation! | Tshiamiso Astronauts",
    html: `
      <div style="font-family: sans-serif; color: #1c2e4a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0b848c;">Hi ${firstName},</h2>
        <p>Thank you so much for your generous donation of <strong>R${amount}</strong> to Tshiamiso Astronauts.</p>
        <p>Your support directly funds books, tutors, and digital access for learners in Evaton West.</p>
        <br/>
        <p>Warm regards,</p>
        <p><strong>The Tshiamiso Astronauts Team</strong></p>
      </div>
    `,
  });
};

export const sendDonorNotification = async (firstName: string, lastName: string, email: string, amount: string) => {
  if (!process.env.RESEND_API_KEY) return;
  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Donation Received: R${amount}`,
    html: `
      <div style="font-family: sans-serif; color: #1c2e4a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff6b35;">New Donation Received!</h2>
        <p><strong>Donor:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Amount:</strong> R${amount}</p>
        <p>The donation has been successfully processed via PayFast.</p>
      </div>
    `,
  });
};
