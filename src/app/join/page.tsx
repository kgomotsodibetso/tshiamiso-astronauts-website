import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, Wallet } from "lucide-react";
import JoinForm from "@/components/join/JoinForm";
import { SUPPORT_EMAIL } from "@/config/join";

const TITLE = "Homework Assistance in Evaton West | Tshiamiso Astronauts";
const DESCRIPTION =
  "Homework help after school in Evaton West. Trained tutors, weekdays 14h00 to 17h00, R150 per learner per month. Register your child with Tshiamiso Astronauts.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://tshiamisoastronauts.org/join" },
  openGraph: {
    title: "Homework help after school. Join the Astronauts.",
    description: DESCRIPTION,
    url: "https://tshiamisoastronauts.org/join",
    siteName: "Tshiamiso Astronauts NPC",
    images: [{ url: "/images/social/social-media.png", width: 1200, height: 630, alt: "Tshiamiso Astronauts" }],
    locale: "en_ZA",
    type: "website",
  },
};

// This page is static (built once, served from the CDN). The ?s= source is read in the browser by the form.

const FACTS = [
  { Icon: Clock, label: "When", value: "Weekdays, 14h00 to 17h00" },
  { Icon: MapPin, label: "Where", value: "4206 Kopanong Street, Evaton West" },
  { Icon: Wallet, label: "Cost", value: "R150 per learner per month" },
];

const STEPS = [
  "Register, about 3 minutes.",
  "We call you within 7 days.",
  "Your child starts.",
  "Pay by EFT or cash at our centre.",
];

export default function JoinPage() {
  return (
    <>
      <section className="bg-brand-navy px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-light-teal">
            Homework Assistance, Evaton West
          </p>
          <h1 className="text-balance text-4xl font-bold leading-tight text-white md:text-5xl">Homework help after school.</h1>
          <p className="mt-3 text-2xl font-semibold text-brand-light-teal md:text-3xl">Join the Astronauts.</p>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white">
            Trained tutors help learners finish their homework, understand their schoolwork and prepare for tests.
          </p>
          <a
            href="#register"
            className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-lg bg-brand-orange px-8 py-3 text-lg font-bold text-brand-navy hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Register your child
          </a>
        </div>
      </section>

      <section className="bg-brand-white px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <ul className="grid gap-5 md:grid-cols-3">
            {FACTS.map(({ Icon, label, value }) => (
              <li key={label} className="rounded-2xl bg-brand-card p-6">
                <Icon className="h-8 w-8 text-brand-teal" aria-hidden="true" />
                <h2 className="mt-4 text-sm font-semibold uppercase tracking-widest text-brand-navy">{label}</h2>
                <p className="mt-1 text-xl font-bold leading-snug text-brand-navy">{value}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-brand-navy md:text-3xl">What happens next</h2>
          <ol className="mt-6 space-y-4">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-start gap-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy font-bold text-white"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="pt-1.5 text-lg leading-snug text-brand-navy">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-brand-card px-6 py-8">
        <p className="mx-auto max-w-3xl text-center text-lg font-semibold leading-relaxed text-brand-navy">
          Also available to Homework Assistance families: Kids Reading Club, TA Book Club and Digital Skills.
        </p>
      </section>

      <section id="register" className="scroll-mt-20 bg-brand-white px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-brand-navy md:text-3xl">Register your child</h2>
          <p className="mb-6 mt-2 text-brand-navy">It takes about 3 minutes. A member of our team will call you within 7 days.</p>
          <div className="rounded-2xl bg-brand-card p-5 sm:p-8">
            <JoinForm />
          </div>
          <p className="mt-8 text-sm leading-relaxed text-brand-navy">
            Nobody asks for payment at a desk or event. We only use your details to contact you about TA programmes. Read
            our{" "}
            <Link href="/privacy" className="font-semibold underline">
              Privacy Policy
            </Link>
            . Questions? Email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline">
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
