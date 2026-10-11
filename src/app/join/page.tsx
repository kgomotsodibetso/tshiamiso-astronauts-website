import type { Metadata } from "next";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import JoinForm from "@/components/join/JoinForm";

const TITLE = "Join the Astronauts | Tshiamiso Astronauts";
const DESCRIPTION =
  "Tell Tshiamiso Astronauts about your family. Reading clubs, homework help, digital skills and university application support for learners and adults in Evaton West.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://tshiamisoastronauts.org/join" },
  openGraph: {
    title: "Join the Astronauts",
    description: "Tell us about your family and we will call you within 7 days.",
    url: "https://tshiamisoastronauts.org/join",
    siteName: "Tshiamiso Astronauts NPC",
    images: [{ url: "/images/social/social-media.png", width: 1200, height: 630, alt: "Tshiamiso Astronauts" }],
    locale: "en_ZA",
    type: "website",
  },
};

// This page is static (built once, served from the CDN). The ?s= source is read in the browser by the form.

const CARDS = [
  {
    Icon: BookOpen,
    title: "For learners",
    body: "Kids Reading Club, homework help for Grades 1 to 12, and a place to grow in confidence with other young readers.",
  },
  {
    Icon: Users,
    title: "For parents and guardians",
    body: "Steady support for your child outside school, and one friendly person at TA you can talk to. Tell us about your family and we will explain what fits.",
  },
  {
    Icon: GraduationCap,
    title: "For older learners and adults",
    body: "University application help for matriculants, digital skills in coding, UX and data, and the TA Book Club.",
  },
];

const STEPS = [
  "We call you within 7 days.",
  "Your child comes to a taster session.",
  "After we speak, we set up the debit order.",
  "Learning starts.",
];

export default function JoinPage() {
  return (
    <>
      <section className="bg-brand-navy px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-light-teal">
            Tshiamiso Astronauts, Evaton West
          </p>
          <h1 className="text-balance text-4xl font-bold leading-tight text-white md:text-5xl">Join the Astronauts</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white">
            Tell us about your family and we will help you find the right place to start.
          </p>
          <a
            href="#family-form"
            className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-lg bg-brand-orange px-8 py-3 text-lg font-bold text-brand-navy hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Tell us about your family
          </a>
        </div>
      </section>

      <section className="bg-brand-white px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <ul className="grid gap-5 md:grid-cols-3">
            {CARDS.map(({ Icon, title, body }) => (
              <li key={title} className="rounded-2xl bg-brand-card p-6">
                <Icon className="h-8 w-8 text-brand-teal" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-bold text-brand-navy">{title}</h2>
                <p className="mt-2 leading-relaxed text-brand-navy">{body}</p>
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

      <section id="family-form" className="scroll-mt-20 bg-brand-white px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-brand-navy md:text-3xl">Tell us about your family</h2>
          <p className="mb-6 mt-2 text-brand-navy">It takes about 5 minutes. A member of our team will call you within 7 days.</p>
          <div className="rounded-2xl bg-brand-card p-5 sm:p-8">
            <JoinForm />
          </div>
        </div>
      </section>
    </>
  );
}
