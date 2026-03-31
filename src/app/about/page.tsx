import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Tshiamiso Astronauts",
  description:
    "Learn about Tshiamiso Astronauts NPC — our mission, values, and the team transforming literacy and education in Evaton West, Gauteng.",
};

const values = [
  {
    letter: "I",
    word: "Innovation",
    description:
      "Embrace creativity and explore new ideas to continuously improve our programmes and community impact.",
  },
  {
    letter: "N",
    word: "Nurturing",
    description:
      "Support and encourage the growth and development of every individual within our organisation and community.",
  },
  {
    letter: "S",
    word: "Solidarity",
    description:
      "Stand united and work collaboratively to overcome challenges and support one another.",
  },
  {
    letter: "P",
    word: "Professionalism",
    description:
      "Maintain high standards of conduct and competence in all tasks and interactions.",
  },
  {
    letter: "I",
    word: "Integrity",
    description:
      "Act with honesty, transparency, and accountability at all times.",
  },
  {
    letter: "R",
    word: "Respect",
    description:
      "Value diversity and treat everyone with dignity, recognising the unique contributions each person makes.",
  },
  {
    letter: "E",
    word: "Empowerment",
    description:
      "Enable individuals to reach their full potential through access to knowledge and opportunities.",
  },
];

const team = [
  { name: "Kgomotso Dibetso", role: "Co-Founder" },
  { name: "Tsholofelo Kado", role: "Co-Founder" },
  { name: "Thembani Dube", role: "Co-Founder" },
];

const partners = [
  { name: "Evaton Mall", category: "Community Partner" },
  { name: "Chief Bambatha Community Structures", category: "Community Partner" },
  { name: "Partner Name", category: "Coming Soon" },
  { name: "Partner Name", category: "Coming Soon" },
];

export default function AboutPage() {
  return (
    <>
      {/* 1. HERO BANNER */}
      <section className="bg-gradient-to-br from-brand-navy to-brand-teal py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-brand-light-teal text-sm font-semibold uppercase tracking-widest mb-4">
            About Us
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            We Believe Reading{" "}
            <span className="text-brand-orange">Changes Lives</span>
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Founded in Evaton West, Gauteng, Tshiamiso Astronauts NPC is a
            community-driven non-profit organisation on a mission to close South
            Africa&apos;s literacy gap — one reader at a time.
          </p>
        </div>
      </section>

      {/* 2. OUR STORY */}
      <section className="py-20 px-6 bg-brand-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 items-start">
            {/* Story text */}
            <div className="md:col-span-2">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">
                Our Story
              </h2>
              <div className="space-y-5 text-gray-700 text-lg leading-relaxed">
                <p>
                  In April 2022, three community members — Kgomotso Dibetso,
                  Tsholofelo Kado, and Thembani Dube — looked at Evaton West and
                  saw a gap that couldn&apos;t be ignored: a community with a deep
                  hunger for knowledge, but no accessible library or literacy
                  support to feed it.
                </p>
                <p>
                  Their response was simple and bold: build one. They established
                  a community library and launched the first TA Book Club, giving
                  children, youth, adults, and the elderly a place to access
                  books, engage with ideas, and grow together.
                </p>
                <p>
                  What started as a single programme has since grown into nine —
                  spanning homework assistance, digital skills, university
                  guidance, spelling bees, public speaking, and more. Every
                  programme is rooted in the same belief that drove the founders
                  in 2022: that access to knowledge is a right, not a privilege.
                </p>
                <p>
                  Today, Tshiamiso Astronauts NPC serves hundreds of learners
                  each year. We are motivated by every child who reads their
                  first full book, every student who secures a university place,
                  and every community member who gains a skill that opens a new
                  door. South Africa has a literacy crisis. We exist to help
                  solve it.
                </p>
              </div>
            </div>

            {/* Founding facts */}
            <div className="bg-brand-navy rounded-2xl p-8 text-white space-y-6">
              <div>
                <p className="text-brand-light-teal text-xs font-bold uppercase tracking-widest mb-1">
                  Founded
                </p>
                <p className="text-2xl font-bold text-brand-orange">
                  29 April 2022
                </p>
              </div>
              <div>
                <p className="text-brand-light-teal text-xs font-bold uppercase tracking-widest mb-1">
                  Location
                </p>
                <p className="text-lg font-semibold">Evaton West, Gauteng</p>
              </div>
              <div>
                <p className="text-brand-light-teal text-xs font-bold uppercase tracking-widest mb-1">
                  Registration
                </p>
                <p className="text-sm text-gray-300">NPO: 294-255</p>
                <p className="text-sm text-gray-300">PBO: 930083956</p>
                <p className="text-sm text-gray-300">Section 18A Approved</p>
              </div>
              <div>
                <p className="text-brand-light-teal text-xs font-bold uppercase tracking-widest mb-1">
                  B-BBEE Status
                </p>
                <p className="text-sm text-gray-300">
                  Level One — 135% procurement recognition
                </p>
              </div>
              <div>
                <p className="text-brand-light-teal text-xs font-bold uppercase tracking-widest mb-1">
                  Programmes
                </p>
                <p className="text-2xl font-bold text-brand-orange">9</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MEET THE TEAM */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">
              Meet the Team
            </h2>
            <p className="text-brand-teal text-lg max-w-xl mx-auto">
              Tshiamiso Astronauts was built by community members, for the
              community.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map(({ name, role }) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100"
              >
                {/* Avatar placeholder */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-teal to-brand-navy mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-brand-navy font-bold text-lg mb-1">
                  {name}
                </h3>
                <p className="text-brand-orange text-sm font-semibold">
                  {role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. INSPIRE VALUES */}
      <section className="py-20 px-6 bg-brand-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-3">
              Our Core Values
            </h2>
            <p className="text-brand-teal text-lg max-w-xl mx-auto mb-2">
              We are guided by{" "}
              <span className="font-bold text-brand-orange">INSPIRE</span> — a
              set of values that shape everything we do.
            </p>
            <p className="text-gray-500 text-sm italic">
              &ldquo;Innovate, Nurture, Stand United, Practice Integrity, Respect
              and Empower.&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {values.map(({ letter, word, description }) => (
              <div
                key={word}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4 items-start"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-navy flex items-center justify-center">
                  <span className="text-brand-orange font-bold text-xl">
                    {letter}
                  </span>
                </div>
                <div>
                  <h3 className="text-brand-navy font-bold text-lg mb-1">
                    {word}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PARTNERS & SUPPORTERS */}
      <section className="py-20 px-6 bg-brand-navy">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Partners &amp; Supporters
          </h2>
          <p className="text-brand-light-teal text-lg mb-12 max-w-xl mx-auto">
            We are grateful to the organisations and community structures that
            stand with us.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {partners.map(({ name, category }) => (
              <div
                key={name + category}
                className="bg-white/10 rounded-xl p-6 border border-white/20"
              >
                <p className="text-white font-semibold text-sm mb-1">{name}</p>
                <p className="text-brand-light-teal text-xs">{category}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-8">
            Interested in partnering with us?{" "}
            <a
              href="mailto:info@tshiamisoastronauts.org"
              className="text-brand-orange hover:underline"
            >
              Get in touch
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
