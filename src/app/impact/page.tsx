import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PencilLine, BookOpen, Library, Utensils, Trophy, GraduationCap, Monitor, MapPin } from "lucide-react";
import { recapData as d, fmt } from "@/lib/recapData";

export const metadata: Metadata = {
  title: "Our Impact | Tshiamiso Astronauts",
  description:
    "See the real-world difference Tshiamiso Astronauts is making — learners reached, programmes delivered, and communities transformed in Evaton West.",
  openGraph: {
    title: "Our Impact | Tshiamiso Astronauts",
    description:
      "See the real-world difference Tshiamiso Astronauts is making — learners reached, programmes delivered, and communities transformed in Evaton West.",
    url: "https://tshiamisoastronauts.org/impact",
    siteName: "Tshiamiso Astronauts NPC",
    images: [{ url: "/images/social/social-media.png", width: 1200, height: 630, alt: "Tshiamiso Astronauts — Literacy & Education NPO" }],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Impact | Tshiamiso Astronauts",
    description:
      "See the real-world difference Tshiamiso Astronauts is making — learners reached, programmes delivered, and communities transformed in Evaton West.",
    images: ["/images/social/social-media.png"],
  },
};

const stats = [
  { value: fmt(d.attendanceRecords), label: "Learner Attendances", description: "Homework, reading and library sessions attended since February 2026" },
  { value: `${fmt(Math.floor(d.learnerHours / 100) * 100)}+`, label: "Learner Hours", description: "Hours of tutoring, reading and learning logged in 2026" },
  { value: String(d.sessionDays), label: "Session Days", description: "Days our doors were open for learners at 4206 Kopanong Street" },
  { value: fmt(d.soupKitchenVisits), label: "Soup Kitchen Visits", description: `Mostly lunches, across ${d.soupKitchenServiceDays} service days` },
];

const highlights = [
  {
    Icon: PencilLine,
    programme: "Homework Assistance",
    stat: `${d.programmes.homeworkAssistance.days} days run`,
    result:
      `Our most attended programme: roughly ${fmt(d.programmes.homeworkAssistance.records)} attendances and about ${fmt(d.programmes.homeworkAssistance.hours)} learner hours in 2026. Tutors work one-on-one and in small groups across Maths, English and Bokgoni (Setswana), closing learning gaps the classroom alone cannot address.`,
  },
  {
    Icon: BookOpen,
    programme: "Book Club",
    stat: `${d.programmes.bookClub.days} sessions`,
    result:
      `Roughly ${d.programmes.bookClub.records} attendances and ${d.programmes.bookClub.hours} learner hours of reading together, plus ${d.programmes.saturdayBookClub.days} Saturday Book Club sessions with ${d.programmes.saturdayBookClub.hours} more hours.`,
  },
  {
    Icon: Library,
    programme: "Library",
    stat: `${d.programmes.library.days} open days`,
    result:
      `A quiet, safe place to read and study: roughly ${d.programmes.library.records} library visits and ${d.programmes.library.hours} hours in 2026.`,
  },
  {
    Icon: Utensils,
    programme: "Soup Kitchen",
    stat: `${fmt(d.soupKitchenVisits)} visits`,
    result:
      `Hungry children cannot learn. Across ${d.soupKitchenServiceDays} service days we served ${fmt(d.soupKitchenVisits)} visits, mostly lunch, with children under 13 making up almost half of them.`,
  },
  {
    Icon: GraduationCap,
    programme: "University Application Assistance",
    stat: "Matric support",
    result:
      "Matriculants get hands-on help with university and TVET College applications and NSFAS submissions, so no young person in Evaton West misses out on higher education for lack of information.",
  },
  {
    Icon: Monitor,
    programme: "Digital Skills Development",
    stat: "Future-ready skills",
    result:
      "Community members build skills in Computer Literacy, Programming, Graphic Design, UX Design, Social Media Management and Data Analysis, opening doors to work and entrepreneurship.",
  },
];

const testimonials = [
  {
    quote:
      "Before I joined the Homework Assistance programme, I was struggling with Maths and couldn't keep up in class. Now I actually enjoy it. The tutors are patient and they explain things in a way that makes sense.",
    name: "Learner, Grade 9",
    programme: "Homework Assistance",
  },
  {
    quote:
      "The Holiday Programme is a blessing for our community. My children come home every day excited about what they learned and made. It keeps them safe, busy, and growing — and it's free. I am so grateful.",
    name: "Parent, Evaton West",
    programme: "School Holiday Programme",
  },
  {
    quote:
      "I didn't know where to start with my university application. The team at TA walked me through everything — the forms, NSFAS, which courses to apply for. I'm now studying towards my degree.",
    name: "Matriculant, Class of 2024",
    programme: "University Application Assistance",
  },
];

export default function ImpactPage() {
  return (
    <>
      {/* 1. HERO */}
      <section className="relative py-24 px-6 text-center">
        <Image
          src="/images/impact-page/impact-hero.jpg"
          alt="Tshiamiso Astronauts Impact"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-brand-navy/70" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-brand-light-teal text-sm font-semibold uppercase tracking-widest mb-4">
            #Breakthrough2026
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            The Year of{" "}
            <span className="text-brand-orange">Breakthrough</span>
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto leading-relaxed">
            2026 is our Year of Breakthrough: moving from survival to structured,
            measurable impact. Here is what we have done so far, in real
            numbers. Updated {d.asOfLabel}.
          </p>
        </div>
      </section>

      {/* 2. IMPACT STATS */}
      <section className="bg-brand-navy py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, label, description }) => (
            <div key={label} className="text-center">
              <p className="text-5xl md:text-6xl font-bold text-brand-orange mb-2">
                {value}
              </p>
              <p className="text-brand-light-teal font-bold text-sm uppercase tracking-wide mb-2">
                {label}
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PROGRAMME HIGHLIGHTS */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">
              Programme Highlights
            </h2>
            <p className="text-brand-teal text-lg max-w-xl mx-auto">
              What our programmes have delivered in 2026 so far. Programme splits are
              approximate; overall totals are exact as at {d.asOfLabel}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {highlights.map(({ Icon, programme, stat, result }) => (
              <div
                key={programme}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0">
                    <Icon className="text-brand-orange" size={22} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-brand-navy font-bold text-lg leading-tight">
                      {programme}
                    </h3>
                    <span className="inline-block bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full mt-1">
                      {stat}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPELLING BEE SPOTLIGHT */}
      <section className="py-20 px-6 bg-brand-teal">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 rounded-xl bg-brand-navy flex items-center justify-center mx-auto mb-6">
            <Trophy className="text-brand-orange" size={26} strokeWidth={2} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Road to the Spelling Bee Grand Final
          </h2>
          <p className="text-gray-100 text-lg max-w-2xl mx-auto mb-10">
            {d.spellingBee.schoolQualifiers} school qualifiers are done and{" "}
            {d.spellingBee.finalists} finalists from Grades 4 to 7 are going
            through to the 2026 TA Regional Spelling Bee Grand Final.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div>
              <p className="text-5xl font-bold text-brand-navy">{d.spellingBee.schoolQualifiers}</p>
              <p className="text-white text-sm font-bold uppercase tracking-wide">School qualifiers</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-brand-navy">{d.spellingBee.finalists}</p>
              <p className="text-white text-sm font-bold uppercase tracking-wide">Finalists</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-brand-navy">23 Oct</p>
              <p className="text-white text-sm font-bold uppercase tracking-wide">Grand Final</p>
            </div>
          </div>
          <p className="flex items-center justify-center gap-2 text-white mb-6">
            <MapPin size={18} aria-hidden="true" />
            {d.spellingBee.grandFinalLabel} · {d.spellingBee.venue}
          </p>
          <a
            href={d.spellingBee.rsvpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-brand-orange text-white font-bold px-10 py-4 rounded-lg text-lg hover:bg-orange-600 transition-colors"
          >
            RSVP for the Grand Final
          </a>
          <p className="text-gray-100 text-sm mt-4">
            RSVPs close {d.spellingBee.rsvpClosesLabel}. Proudly supported by Evaton Mall.
          </p>
        </div>
      </section>

      {/* 4. TESTIMONIALS */}
      <section className="py-20 px-6 bg-brand-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">
              Voices from Our Community
            </h2>
            <p className="text-brand-teal text-lg max-w-xl mx-auto">
              The most powerful measure of impact is the people behind the
              numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(({ quote, name, programme }) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="text-brand-orange text-4xl font-serif leading-none mb-4">
                  &ldquo;
                </div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1 italic">
                  {quote}
                </p>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-brand-navy font-bold text-sm">{name}</p>
                  <p className="text-brand-teal text-xs mt-0.5">{programme}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="bg-brand-orange py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Be Part of the Impact
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Every rand donated and every hour volunteered directly grows the
            numbers on this page. Your support is{" "}
            <strong className="text-white">tax-deductible</strong> under Section
            18A.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="bg-white text-brand-orange font-bold px-10 py-4 rounded-lg text-lg hover:bg-gray-100 transition-colors"
            >
              Donate Now
            </Link>
            <Link
              href="/volunteer"
              className="border-2 border-white text-white font-bold px-10 py-4 rounded-lg text-lg hover:bg-white hover:text-brand-orange transition-colors"
            >
              Volunteer
            </Link>
          </div>
          <p className="text-orange-200 text-sm mt-4">
            PBO: 930083956 · NPO: 294-255 · B-BBEE Level One
          </p>
        </div>
      </section>
    </>
  );
}
