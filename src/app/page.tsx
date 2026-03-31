import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tshiamiso Astronauts — Literacy & Education NPO | Evaton West",
  description:
    "Tshiamiso Astronauts NPC is a South African literacy and education non-profit based in Evaton West, Gauteng, running spelling bees, tutoring, and community programmes.",
};

const programmes = [
  {
    icon: "📚",
    name: "TA Book Club",
    tagline: "Where readers become thinkers.",
    excerpt:
      "Each month, community members gather to explore a member-selected book through structured discussion, Q&A, and shared reflection. A space for adults in Evaton West to grow their minds and build a lifelong love of reading.",
  },
  {
    icon: "🌟",
    name: "Children's Reading Club",
    tagline: "Every page is a new adventure.",
    excerpt:
      "Every week, young readers explore a different book together through reading, discussion, and fun story-inspired activities. Where imagination is celebrated and every child is an Astronaut in the making.",
  },
  {
    icon: "✏️",
    name: "Homework Assistance",
    tagline: "Extra support, extraordinary results.",
    excerpt:
      "Structured academic support for learners in Grades 1–12 across Maths, English, and Bokgoni (Setswana). Our trained tutors work one-on-one and in small groups to close learning gaps and build confidence.",
  },
  {
    icon: "🎓",
    name: "University Application Assistance",
    tagline: "Your future starts here.",
    excerpt:
      "We guide every eligible matriculant through university and TVET College applications — from choosing an institution to completing NSFAS forms. No learner in Evaton West should miss higher education for lack of support.",
  },
  {
    icon: "💻",
    name: "Digital Skills Development",
    tagline: "The skills of tomorrow, available today.",
    excerpt:
      "Certified training in Computer Literacy, Programming, Graphic Design, UX Design, Social Media Management, and Data Analysis — all delivered at our Evaton West facility.",
  },
  {
    icon: "☀️",
    name: "School Holiday Programme",
    tagline: "Learning never takes a holiday.",
    excerpt:
      "During school holidays, our doors stay open for reading, creative writing, arts, and team-building. Our flagship community event — serving nearly 400 children across June and July 2024 alone.",
  },
  {
    icon: "🏛️",
    name: "TA Evaton West Library",
    tagline: "Knowledge belongs to everyone.",
    excerpt:
      "A fully furnished community library open to learners, students, families, and adults — offering books, a quiet study space, internet access, and reading resources.",
  },
  {
    icon: "🏆",
    name: "Spelling Bee Competition",
    tagline: "Words are power. Compete with confidence.",
    excerpt:
      "Our annual Spelling Bee draws competitors from Grades 4–7, parents, and community leaders. Preliminary rounds build to a Grand Finale with partnerships from Evaton Mall and Chief Bambatha community structures.",
  },
  {
    icon: "🎤",
    name: "Public Speaking Programme",
    tagline: "Find your voice. Own the room.",
    excerpt:
      "Young people develop the confidence and skills to express themselves clearly and powerfully — skills that serve them in school, interviews, and life.",
  },
];

const stats = [
  { value: "500+", label: "Learners Reached" },
  { value: "9", label: "Programmes" },
  { value: "400+", label: "Holiday Campers (2024)" },
  { value: "3+", label: "Years Active" },
];

export default function HomePage() {
  return (
    <>
      {/* 1. HERO */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-navy via-[#001a80] to-brand-teal px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-brand-light-teal text-sm font-semibold uppercase tracking-widest mb-4">
            Tshiamiso Astronauts NPC · Evaton West, Gauteng
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Reading Changes{" "}
            <span className="text-brand-orange">Everything</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tshiamiso Astronauts NPC is on a mission to close the literacy gap
            in Gauteng, one child at a time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="bg-brand-orange text-white font-bold px-8 py-4 rounded-lg text-lg hover:opacity-90 transition-opacity"
            >
              Donate Now
            </Link>
            <Link
              href="/programmes"
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-white hover:text-brand-navy transition-colors"
            >
              Our Programmes
            </Link>
          </div>
        </div>
      </section>

      {/* 2. MISSION & VISION */}
      <section className="py-20 px-6 bg-brand-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy text-center mb-12">
            Who We Are
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border-t-4 border-brand-orange">
              <h3 className="text-brand-orange font-bold text-xs uppercase tracking-widest mb-3">
                Our Mission
              </h3>
              <p className="text-brand-navy text-lg leading-relaxed">
                To promote reading and improve literacy rates in our community
                through various programmes and initiatives.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border-t-4 border-brand-teal">
              <h3 className="text-brand-teal font-bold text-xs uppercase tracking-widest mb-3">
                Our Vision
              </h3>
              <p className="text-brand-navy text-lg leading-relaxed">
                To create a more literate and educated community where
                individuals are empowered to reach their full potential through
                the transformative power of reading and access to knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. IMPACT STATS */}
      <section className="bg-brand-navy py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl md:text-5xl font-bold text-brand-orange mb-2">
                {value}
              </p>
              <p className="text-brand-light-teal text-sm font-medium uppercase tracking-wide">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PROGRAMMES OVERVIEW */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">
              What We Do
            </h2>
            <p className="text-brand-teal text-lg max-w-xl mx-auto">
              Nine programmes. One mission. Transforming lives through literacy
              and education in Evaton West.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programmes.map(({ icon, name, tagline, excerpt }) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="text-brand-navy font-bold text-lg mb-1">
                  {name}
                </h3>
                <p className="text-brand-orange text-sm font-semibold italic mb-3">
                  {tagline}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {excerpt}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/programmes"
              className="inline-flex items-center gap-2 text-brand-teal font-semibold hover:text-brand-navy transition-colors text-lg"
            >
              View All Programmes →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. DONATE BANNER */}
      <section className="bg-brand-orange py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your donation changes a life in Evaton West
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Tshiamiso Astronauts NPC is Section 18A approved — your donation is{" "}
            <strong className="text-white">tax-deductible</strong>. Every rand
            goes directly to our programmes.
          </p>
          <Link
            href="/donate"
            className="inline-block bg-white text-brand-orange font-bold px-10 py-4 rounded-lg text-lg hover:bg-gray-100 transition-colors"
          >
            Donate Now
          </Link>
          <p className="text-orange-200 text-sm mt-4">
            PBO: 930083956 · NPO: 294-255 · B-BBEE Level One
          </p>
        </div>
      </section>

      {/* 6. VOLUNTEER CTA */}
      <section className="py-20 px-6 bg-brand-white text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-brand-teal font-semibold text-sm uppercase tracking-widest mb-3">
            Get Involved
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            Join the Mission
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            We are always looking for passionate people — tutors, mentors,
            organisers, and professionals — to help us reach more learners in
            Evaton West. No experience required, just a willingness to make a
            difference.
          </p>
          <Link
            href="/volunteer"
            className="inline-block bg-brand-teal text-white font-bold px-10 py-4 rounded-lg text-lg hover:opacity-90 transition-opacity"
          >
            Become a Volunteer
          </Link>
        </div>
      </section>
    </>
  );
}
