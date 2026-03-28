import Link from "next/link";

const stats = [
  { value: "500+", label: "Learners Reached", description: "Children, youth, and adults served across all programmes" },
  { value: "9", label: "Active Programmes", description: "From homework support to digital skills and university guidance" },
  { value: "400+", label: "Holiday Campers", description: "Children who attended our School Holiday Programme in 2024 alone" },
  { value: "3+", label: "Years of Impact", description: "Serving the Evaton West community since April 2022" },
];

const highlights = [
  {
    icon: "✏️",
    programme: "Homework Assistance",
    stat: "Highest Attendance",
    result:
      "Our most attended programme — serving hundreds of learners in 2026 across Grades 1 to 12. Tutors work one-on-one and in small groups across Maths, English, and Bokgoni (Setswana), closing learning gaps that the classroom alone cannot address.",
  },
  {
    icon: "☀️",
    programme: "School Holiday Programme",
    stat: "400+ Campers in 2024",
    result:
      "Nearly 400 children attended our School Holiday Programme across June and July 2024. Multi-day sessions covering reading, creative writing, arts, crafts, and team-building — keeping children engaged, learning, and safe during the school holidays.",
  },
  {
    icon: "🎓",
    programme: "University Application Assistance",
    stat: "Zero learners left behind",
    result:
      "Every eligible matriculant who comes through our doors leaves with a completed university or TVET College application and NSFAS submission. We ensure that no young person in Evaton West misses out on higher education due to a lack of information or support.",
  },
  {
    icon: "💻",
    programme: "Digital Skills Development",
    stat: "Future-ready skills",
    result:
      "Community members gain certified skills in Computer Literacy, Programming, Graphic Design, UX Design, Social Media Management, and Data Analysis — equipping them for the digital economy and opening doors to employment and entrepreneurship.",
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
      <section className="bg-gradient-to-br from-brand-navy to-brand-teal py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-brand-light-teal text-sm font-semibold uppercase tracking-widest mb-4">
            Our Impact
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Real Change in{" "}
            <span className="text-brand-orange">Real Lives</span>
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto leading-relaxed">
            Since April 2022, Tshiamiso Astronauts NPC has been transforming
            lives in Evaton West through literacy, education, and community
            empowerment. Here is what that looks like in numbers and in stories.
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
              The stories behind our numbers — what our programmes are actually
              achieving on the ground.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {highlights.map(({ icon, programme, stat, result }) => (
              <div
                key={programme}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{icon}</div>
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
            <p className="text-gray-400 text-xs mt-2 italic">
              * Testimonials are illustrative placeholders — replace with real
              community voices when available.
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
