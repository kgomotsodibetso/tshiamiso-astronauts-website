import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Tshiamiso Astronauts NPC",
  description:
    "How Tshiamiso Astronauts NPC collects, uses, and protects your personal information in accordance with POPIA.",
};

const LAST_UPDATED = "2 June 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-brand-teal text-sm font-semibold uppercase tracking-widest mb-2">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-3">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-sm sm:prose max-w-none text-gray-700 space-y-8">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-3">
              1. Who we are
            </h2>
            <p>
              <strong>Tshiamiso Astronauts NPC</strong> (&ldquo;we&rdquo;,
              &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a non-profit company
              registered in South Africa (NPO: 294-255, PBO: 930083956). Our
              principal place of business is 4206 Kopanong Street, Ext 3,
              Evaton West, Mafatsana, 1984, Gauteng.
            </p>
            <p className="mt-2">
              We are the <strong>responsible party</strong> as defined in the{" "}
              <em>
                Protection of Personal Information Act 4 of 2013 (&ldquo;POPIA&rdquo;)
              </em>{" "}
              with respect to personal information collected through this
              website.
            </p>
            <p className="mt-2">
              Questions or requests relating to this policy may be directed to
              our Information Officer at{" "}
              <a
                href="mailto:info@tshiamisoastronauts.org"
                className="text-brand-teal hover:text-brand-orange underline"
              >
                info@tshiamisoastronauts.org
              </a>
              .
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-3">
              2. What personal information we collect
            </h2>
            <p>
              We collect only the personal information you voluntarily provide
              to us through the forms on this website:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Contact form</strong> — first name, last name, email
                address, phone number (optional), and your message.
              </li>
              <li>
                <strong>Donation form</strong> — first name, last name, and
                email address. Payment details are processed directly by PayFast
                and are never stored by us.
              </li>
              <li>
                <strong>Volunteer application</strong> — first name, last name,
                email address, phone number, role preference, availability, and
                relevant skills or experience.
              </li>
            </ul>
            <p className="mt-3">
              We also collect limited technical information automatically when
              you visit our website, including your IP address and pages visited,
              through Vercel Speed Insights for performance monitoring purposes.
              This information is aggregated and is not used to identify you
              personally.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-3">
              3. Why we collect your information
            </h2>
            <p>We process your personal information for the following purposes:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                To respond to your enquiry or contact request.
              </li>
              <li>
                To process your donation and issue a Section 18A tax certificate
                where applicable.
              </li>
              <li>
                To manage your volunteer application and communicate with you
                about placement opportunities.
              </li>
              <li>
                To comply with our legal obligations (e.g., maintaining donation
                records for tax and audit purposes).
              </li>
              <li>
                To improve the performance and usability of our website.
              </li>
            </ul>
            <p className="mt-3">
              We will not use your personal information for direct marketing
              without your separate, explicit consent.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-3">
              4. Legal basis for processing
            </h2>
            <p>
              Under POPIA, we process your personal information on the following
              grounds:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Consent</strong> — where you have given us specific
                consent (e.g., subscribing to updates).
              </li>
              <li>
                <strong>Contractual necessity</strong> — where processing is
                required to fulfil a transaction you initiated (e.g., processing
                a donation).
              </li>
              <li>
                <strong>Legitimate interest</strong> — where we have a genuine
                organisational interest in processing, balanced against your
                rights (e.g., responding to your contact enquiry).
              </li>
              <li>
                <strong>Legal obligation</strong> — where we are required by
                law to retain or process certain records.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-3">
              5. Cookies and tracking technologies
            </h2>
            <p>
              Our website uses cookies and similar tracking technologies. These
              fall into the following categories:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Strictly necessary cookies</strong> — required for the
                website to function (e.g., session management). These cannot be
                disabled.
              </li>
              <li>
                <strong>Performance cookies</strong> — used by Vercel Speed
                Insights to collect anonymised usage data so we can improve site
                performance. No personally identifiable information is captured.
              </li>
            </ul>
            <p className="mt-3">
              You may withdraw consent to non-essential cookies at any time by
              clicking &ldquo;Decline&rdquo; on the cookie banner or by
              adjusting your browser settings. Please note that declining
              performance cookies will not affect your ability to use the
              website.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-3">
              6. How we share your information
            </h2>
            <p>
              We do not sell, rent, or trade your personal information. We may
              share it with the following third parties solely to fulfil the
              purposes described above:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Resend</strong> — our email delivery provider, used to
                send you a copy of your contact or volunteer submission and to
                deliver our responses.
              </li>
              <li>
                <strong>PayFast</strong> — our payment processor. Your financial
                details are passed directly to PayFast and are governed by{" "}
                <a
                  href="https://www.payfast.co.za/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-teal hover:text-brand-orange underline"
                >
                  PayFast&apos;s own Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Vercel</strong> — our website hosting provider, which
                processes limited technical data (e.g., IP address) in the
                course of delivering our website.
              </li>
            </ul>
            <p className="mt-3">
              All third-party service providers are required to handle your
              information securely and only for the purposes for which it was
              shared.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-3">
              7. How long we keep your information
            </h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Contact and volunteer enquiries are retained for up to{" "}
                <strong>3 years</strong> from the date of submission.
              </li>
              <li>
                Donation records are retained for <strong>5 years</strong> to
                comply with South African tax and non-profit regulations.
              </li>
              <li>
                Website performance data collected through Vercel is retained in
                accordance with Vercel&apos;s data retention policies.
              </li>
            </ul>
            <p className="mt-3">
              When personal information is no longer required, we will securely
              delete or anonymise it.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-3">
              8. Your rights under POPIA
            </h2>
            <p>
              As a data subject you have the following rights, which you may
              exercise free of charge by contacting our Information Officer:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong>Right of access</strong> — to request a copy of the
                personal information we hold about you.
              </li>
              <li>
                <strong>Right to correction</strong> — to request that we
                correct inaccurate or incomplete information.
              </li>
              <li>
                <strong>Right to deletion</strong> — to request that we delete
                your personal information, subject to our legal retention
                obligations.
              </li>
              <li>
                <strong>Right to object</strong> — to object to the processing
                of your personal information on legitimate interest grounds.
              </li>
              <li>
                <strong>Right to lodge a complaint</strong> — to lodge a
                complaint with the{" "}
                <strong>
                  Information Regulator of South Africa
                </strong>{" "}
                if you believe your rights have been infringed.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <a
                href="mailto:info@tshiamisoastronauts.org"
                className="text-brand-teal hover:text-brand-orange underline"
              >
                info@tshiamisoastronauts.org
              </a>
              . We will respond within <strong>30 days</strong>.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-3">
              9. Information Regulator
            </h2>
            <p>
              If you are not satisfied with our response, you may contact the
              Information Regulator of South Africa:
            </p>
            <address className="mt-2 not-italic text-sm leading-relaxed">
              JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001
              <br />
              Email:{" "}
              <a
                href="mailto:inforeg@justice.gov.za"
                className="text-brand-teal hover:text-brand-orange underline"
              >
                inforeg@justice.gov.za
              </a>
            </address>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-bold text-brand-navy mb-3">
              10. Changes to this policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be published on this page with an updated &ldquo;Last
              updated&rdquo; date. We encourage you to review this page
              periodically.
            </p>
          </section>

        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="text-brand-teal hover:text-brand-orange text-sm font-semibold transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
