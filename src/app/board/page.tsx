import Link from "next/link";
import {
  getBoardForms,
  isProductionDeployment,
  resolveBoardSource,
  resolveBoardState,
  withSource,
} from "@/config/board";

// Read at request time: the closing date, `?state=` and `?s=` all depend on the request.
export const dynamic = "force-dynamic";

const SUPPORT_EMAIL = "info@tshiamisoastronauts.org";

const SKILLS = [
  { title: "Finance, audit and tax", body: "Keep our money clean, our books reviewed and our PBO status safe." },
  { title: "Legal and governance", body: "Guide our NPC, NPO and PBO duties, policies and good practice." },
  { title: "Fundraising and partnerships", body: "Open doors to donors, sponsors and schools to reach our R5M goal." },
  { title: "Education and community voice", body: "Bring literacy, child safeguarding and Evaton West experience." },
];

const COMMITMENT = [
  { lead: "One Saturday a month", body: "Board meeting, 15h00 to 17h00, plus committee work." },
  { lead: "5-year term", body: "Help steer TA through structured, measurable impact." },
  { lead: "Unpaid, high impact", body: "Real change for children and families in our community." },
];

const WHO_CAN_APPLY = [
  "You care about literacy, education and community development.",
  "You are of good standing in the community with no criminal record.",
  "You can give the time.",
  "You will declare any conflict of interest, and you are not seeking a job at TA or planning to stand for public office.",
];

const HOW_IT_WORKS = [
  "Apply or nominate someone by Friday 27 November.",
  "A committee screens applications in early December.",
  "Shortlisted candidates are interviewed.",
  "Appointments are confirmed at a meeting of our members in the new year.",
];

const focus =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-brand-orange";

function ApplyButton({ href }: { href: string }) {
  // Navy text on orange: white on orange fails contrast.
  return (
    <a
      href={href}
      className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-md bg-brand-orange px-8 py-3 text-base font-bold text-brand-navy transition-opacity hover:opacity-90 sm:w-auto ${focus}`}
    >
      Apply now
    </a>
  );
}

function NominateButton({ href, onNavy = false }: { href: string; onNavy?: boolean }) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-md border-2 border-brand-teal px-8 py-3 text-base font-bold transition-colors sm:w-auto ${
        onNavy ? "text-white hover:bg-white/10" : "text-brand-navy hover:bg-brand-pale-teal"
      } ${focus}`}
    >
      Nominate someone
    </a>
  );
}

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const source = resolveBoardSource(params.s);
  const { state, overridden } = resolveBoardState(params.state);
  const production = isProductionDeployment();
  const forms = getBoardForms();

  const formsReady = forms.apply !== null && forms.nominate !== null;
  // Until Cowork supplies the live links, preview buttons point at a placeholder on this page.
  const placeholder = "#forms-not-open";
  const applyHref = forms.apply ? withSource(forms.apply, forms.passSource, source) : placeholder;
  const nominateHref = forms.nominate ? withSource(forms.nominate, forms.passSource, source) : placeholder;
  // Safety net: a production deploy with no live links must not show buttons that go nowhere.
  const showButtons = state === "open" && (formsReady || !production);

  const ribbon = !production
    ? !formsReady
      ? "Preview, forms not yet open"
      : overridden
        ? `Preview, showing the ${state} state`
        : null
    : null;

  return (
    <article>
      {ribbon && (
        <p role="status" className="bg-brand-navy px-4 py-2 text-center text-sm font-semibold text-white">
          {ribbon}
        </p>
      )}

      <section aria-labelledby="board-heading">
        <div className="bg-brand-teal">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            {state === "open" ? (
              <>
                <p className="inline-block rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand-navy">
                  Board recruitment, Year of Breakthrough 2026
                </p>
                <h1 id="board-heading" className="mt-5 text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
                  Help us break through.
                </h1>
                <p className="mt-3 text-2xl font-bold text-white sm:text-3xl">Join the TA Board.</p>
              </>
            ) : (
              <h1 id="board-heading" className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
                Board applications are closed.
              </h1>
            )}
          </div>
        </div>
        <div className="h-2 bg-brand-orange" aria-hidden="true" />

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          {state === "open" ? (
            <>
              <p className="max-w-3xl text-lg leading-relaxed">
                Tshiamiso Astronauts is opening seats on its Board of Directors. We are looking for people who will
                guide a literate, empowered and confident Evaton West.
              </p>
              <p className="mt-6 inline-block rounded-md border-l-8 border-brand-orange bg-brand-pale-teal px-5 py-3 text-base font-bold">
                Applications and nominations close Friday 27 November 2026.
              </p>
              {showButtons && (
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <ApplyButton href={applyHref} />
                  <NominateButton href={nominateHref} />
                </div>
              )}
              {!showButtons && (
                <p className="mt-8 text-base">
                  Questions? Write to{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex min-h-[44px] items-center font-semibold underline">
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
              )}
            </>
          ) : (
            <>
              <p className="max-w-3xl text-lg leading-relaxed">
                Thank you to everyone who applied or nominated someone. We are reviewing applications and will contact
                candidates by email. Want to help in another way? Volunteer, donate or partner with us.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-md border-2 border-brand-teal px-8 py-3 text-base font-bold text-brand-navy transition-colors hover:bg-brand-pale-teal sm:w-auto ${focus}`}
                >
                  Volunteer or partner
                </Link>
                <Link
                  href="/donate"
                  className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-md bg-brand-orange px-8 py-3 text-base font-bold text-brand-navy transition-opacity hover:opacity-90 sm:w-auto ${focus}`}
                >
                  Donate
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {state === "open" && (
        <>
          <section aria-labelledby="skills-heading" className="mx-auto max-w-5xl px-4 pb-4 sm:px-6 lg:px-8">
            <h2 id="skills-heading" className="text-2xl font-extrabold sm:text-3xl">
              The skills we are looking for
            </h2>
            <ol className="mt-6 grid gap-5 sm:grid-cols-2">
              {SKILLS.map((skill, i) => (
                <li key={skill.title} className="rounded-xl border-t-4 border-brand-teal bg-brand-pale-teal p-6">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-teal text-xl font-extrabold text-white"
                  >
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{skill.title}</h3>
                  <p className="mt-2 leading-relaxed">{skill.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-label="What we ask of Directors" className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <ul className="grid gap-5 border-y-4 border-brand-teal py-8 md:grid-cols-3">
              {COMMITMENT.map((item) => (
                <li key={item.lead}>
                  <p className="text-xl font-extrabold">{item.lead}</p>
                  <p className="mt-1 leading-relaxed">{item.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <div className="mx-auto grid max-w-5xl gap-10 px-4 pb-10 sm:px-6 md:grid-cols-2 lg:px-8">
            <section aria-labelledby="who-heading">
              <h2 id="who-heading" className="text-2xl font-extrabold sm:text-3xl">
                Who can apply
              </h2>
              <ul className="mt-5 space-y-3">
                {WHO_CAN_APPLY.map((line) => (
                  <li key={line} className="flex gap-3 leading-relaxed">
                    <span aria-hidden="true" className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-orange" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="how-heading">
              <h2 id="how-heading" className="text-2xl font-extrabold sm:text-3xl">
                How it works
              </h2>
              <ol className="mt-5 space-y-4">
                {HOW_IT_WORKS.map((line, i) => (
                  <li key={line} className="flex items-start gap-4 leading-relaxed">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-lg font-bold text-white"
                    >
                      {i + 1}
                    </span>
                    <span className="pt-1">{line}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <section aria-labelledby="nominate-heading" className="mx-auto max-w-5xl px-4 pb-10 sm:px-6 lg:px-8">
            <div className="rounded-xl bg-brand-pale-teal p-6 sm:p-8">
              <h2 id="nominate-heading" className="text-2xl font-extrabold sm:text-3xl">
                Know someone brilliant?
              </h2>
              <p className="mt-2 max-w-2xl text-lg leading-relaxed">
                Nominate them. We will invite them to apply, and nobody is appointed on a nomination alone.
              </p>
            </div>
          </section>

          {showButtons && (
            <section aria-label="Apply or nominate" className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
              <div className="rounded-xl bg-brand-navy p-6 text-white sm:p-10">
                <p className="text-xl font-bold sm:text-2xl">Applications and nominations close Friday 27 November 2026.</p>
                <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                  <ApplyButton href={applyHref} />
                  <NominateButton href={nominateHref} onNavy />
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <section aria-label="Privacy and registration" className="mx-auto max-w-5xl px-4 pb-14 sm:px-6 lg:px-8">
        {state === "open" && (
          <div className="max-w-3xl text-sm leading-relaxed">
            <p>We only use your details for this recruitment, in line with POPIA.</p>
            <p>
              Questions? Write to{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex min-h-[44px] items-center font-semibold underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
            <Link href="/privacy" className="inline-flex min-h-[44px] items-center font-semibold underline">
              Privacy Policy
            </Link>
          </div>
        )}
        <p className="mt-4 text-sm font-semibold">
          Tshiamiso Astronauts NPC | NPC 2022/460202/08 | NPO 294-255 | PBO 930083956
        </p>
      </section>
    </article>
  );
}
