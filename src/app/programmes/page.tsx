import Link from "next/link";
import type { Metadata } from "next";
import {
  BookOpen,
  Star,
  PencilLine,
  GraduationCap,
  Monitor,
  Sun,
  Library,
  Trophy,
  Mic,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Programmes | Tshiamiso Astronauts",
  description:
    "Explore Tshiamiso Astronauts' programmes — from Spelling Bee competitions and tutoring to digital skills, arts, and university guidance for learners in Evaton West.",
  openGraph: {
    title: "Our Programmes | Tshiamiso Astronauts",
    description:
      "Explore Tshiamiso Astronauts' programmes — from Spelling Bee competitions and tutoring to digital skills, arts, and university guidance for learners in Evaton West.",
    url: "https://tshiamisoastronauts.org/programmes",
    siteName: "Tshiamiso Astronauts NPC",
    images: [{ url: "/images/social/social-media.png", width: 1200, height: 630, alt: "Tshiamiso Astronauts — Literacy & Education NPO" }],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Programmes | Tshiamiso Astronauts",
    description:
      "Explore Tshiamiso Astronauts' programmes — from Spelling Bee competitions and tutoring to digital skills, arts, and university guidance for learners in Evaton West.",
    images: ["/images/social/social-media.png"],
  },
};

const programmes = [
  {
    Icon: BookOpen,
    anchor: "ta-book-club",
    name: "TA Book Club",
    tagline: "Where readers become thinkers.",
    audience: "Adults",
    audienceColour: "bg-brand-teal",
    description:
      "Each month, community members gather to explore a member-selected book together. Sessions include a structured presentation covering the introduction, characters, plot, and evaluation — followed by lively Q&A discussions. The Book Club is where adults in Evaton West come together to grow their minds, share perspectives, and build a lifelong love of reading.",
  },
  {
    Icon: Star,
    anchor: "childrens-reading-club",
    name: "Children's Reading Club",
    tagline: "Every page is a new adventure.",
    audience: "Children — All Ages",
    audienceColour: "bg-brand-orange",
    description:
      "Every week, our young readers gather to explore a different book together. Through reading, discussion, and fun activities and games inspired by the story, we nurture a love of literature in children of all ages. The Kids Reading Club is where imagination is celebrated and every child is an Astronaut in the making.",
  },
  {
    Icon: PencilLine,
    anchor: "homework-assistance",
    name: "Homework Assistance",
    tagline: "Extra support, extraordinary results.",
    audience: "Grades 1–12",
    audienceColour: "bg-brand-navy",
    description:
      "Our Homework Assistance programme provides learners in Grades 1 to 12 with structured academic support outside the classroom. Covering subjects including Maths, English, and Bokgoni (Setswana), our trained tutors work one-on-one and in small groups to close learning gaps and build confidence. Currently our highest-attendance programme, serving hundreds of learners in 2026.",
  },
  {
    Icon: GraduationCap,
    anchor: "university-application-assistance",
    name: "University Application Assistance",
    tagline: "Your future starts here.",
    audience: "Matriculants",
    audienceColour: "bg-brand-teal",
    description:
      "We guide every eligible matriculant through the university and TVET College application process — from choosing the right institution to completing NSFAS forms and submitting applications on time. No learner in Evaton West should miss out on higher education because of a lack of information or support. We make sure they don't.",
  },
  {
    Icon: Monitor,
    anchor: "digital-skills-development",
    name: "Digital Skills Development",
    tagline: "The skills of tomorrow, available today.",
    audience: "Youth & Adults",
    audienceColour: "bg-brand-orange",
    description:
      "Through our certified Digital Skills programme, we equip community members with in-demand skills for the modern economy. Courses include Computer Literacy, Programming, Digital Project Management, Graphic Design, UX Design, Social Media Management, and Data Analysis. All training is delivered at our Evaton West facility.",
  },
  {
    Icon: Sun,
    anchor: "school-holiday-programme",
    name: "School Holiday Programme",
    tagline: "Learning never takes a holiday.",
    audience: "Children",
    audienceColour: "bg-brand-navy",
    description:
      "During school holidays, our doors stay open. The School Holiday Programme runs multi-day sessions for children featuring reading, creative writing, singing, educational games, arts and crafts, and team-building activities. It is TA's flagship community programme — having served nearly 400 children across June and July 2024 alone.",
  },
  {
    Icon: Library,
    anchor: "ta-evaton-west-library",
    name: "TA Evaton West Library",
    tagline: "Knowledge belongs to everyone.",
    audience: "All Ages",
    audienceColour: "bg-brand-teal",
    description:
      "Our fully furnished community library serves as an information hub for all residents of Evaton West. Open to learners, students, families, and adults alike, the library offers a wide range of books, a quiet study space, internet access, and reading resources. It is managed by our dedicated Librarian and Resource Manager and serves as the physical heart of everything TA does.",
  },
  {
    Icon: Trophy,
    anchor: "spelling-bee-competition",
    name: "Spelling Bee Competition",
    tagline: "Words are power. Compete with confidence.",
    audience: "Grades 4–7",
    audienceColour: "bg-brand-orange",
    description:
      "Our annual Spelling Bee Competition is one of TA's most celebrated community events, drawing competitors from Grades 4 to 7, their parents, and community leaders. Preliminary rounds are held throughout the year, building to a Grand Finale that showcases the literacy progress of our young Astronauts. The competition has attracted partnerships with Evaton Mall and Chief Bambatha community structures.",
  },
  {
    Icon: Mic,
    anchor: "public-speaking-programme",
    name: "Public Speaking Programme",
    tagline: "Find your voice. Own the room.",
    audience: "Youth",
    audienceColour: "bg-brand-navy",
    description:
      "Our Public Speaking programme gives young people the confidence and skills to express themselves clearly and powerfully. Through structured sessions and a culminating event, learners develop communication skills that serve them in school, in interviews, and in life.",
  },
];

export default function ProgrammesPage() {
  return (
    <>
      {/* 1. HERO */}
      <section className="bg-gradient-to-br from-brand-navy to-brand-teal py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-brand-light-teal text-sm font-semibold uppercase tracking-widest mb-4">
            What We Do
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Our <span className="text-brand-orange">Programmes</span>
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Nine programmes. One mission. From homework support to digital
            skills, we meet our community where they are and take them where
            they want to go.
          </p>
        </div>
      </section>

      {/* 2. PROGRAMME CARDS */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programmes.map(({ Icon, anchor, name, tagline, audience, audienceColour, description }) => (
              <div
                key={name}
                id={anchor}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden scroll-mt-20"
              >
                {/* Card header */}
                <div className="p-6 pb-0 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0">
                      <Icon className="text-brand-orange" size={22} strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-brand-navy font-bold text-xl leading-tight">
                        {name}
                      </h2>
                      <p className="text-brand-orange text-sm font-semibold italic mt-0.5">
                        {tagline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="px-6 pt-4 pb-5">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {description}
                  </p>
                  {/* Who it's for badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                      Who it&apos;s for:
                    </span>
                    <span
                      className={`${audienceColour} text-white text-xs font-bold px-3 py-1 rounded-full`}
                    >
                      {audience}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DONATE BANNER */}
      <section className="bg-brand-orange py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Support Our Programmes
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Every donation helps us keep our doors open, buy books, train
            tutors, and reach more learners. Your gift is{" "}
            <strong className="text-white">tax-deductible</strong> under Section
            18A.
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

      {/* 4. VOLUNTEER CTA */}
      <section className="py-20 px-6 bg-brand-white text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-brand-teal font-semibold text-sm uppercase tracking-widest mb-3">
            Get Involved
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            Volunteer With Us
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Our programmes run because of passionate volunteers. Whether
            you&apos;re a teacher, a professional, a student, or simply someone
            who cares — there is a place for you at Tshiamiso Astronauts.
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
