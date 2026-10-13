import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { boardPath, resolveBoardSource, resolveBoardState } from "@/config/board";
import { PageHero } from "../_components/form-ui";
import NominateForm from "./NominateForm";

// Read at request time: the closing date and `?s=` depend on the request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nominate a TA Board Director | Tshiamiso Astronauts",
  description: "Nominate someone for the Board of Tshiamiso Astronauts by Friday 27 November 2026.",
  alternates: { canonical: "https://tshiamisoastronauts.org/board/nominate" },
  robots: { index: false, follow: true },
};

export default async function NominatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const source = resolveBoardSource(params.s);
  const { state, overridden } = resolveBoardState(params.state);
  if (state === "closed") redirect(boardPath("/board", source, overridden ? state : undefined));

  return (
    <article className="pb-16">
      <PageHero
        title="Nominate a TA Board Director"
        intro="Know someone who could help Tshiamiso Astronauts break through? Nominate them here by Friday 27 November 2026. We will invite them to apply; nobody is appointed on a nomination alone."
        backHref={boardPath("/board", source)}
      />
      <div className="mt-8 bg-gray-50 py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <NominateForm source={source} />
        </div>
      </div>
    </article>
  );
}
