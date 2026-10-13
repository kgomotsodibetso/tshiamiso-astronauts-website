import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { boardPath, resolveBoardSource, resolveBoardState } from "@/config/board";
import { PageHero } from "../_components/form-ui";
import ApplyForm from "./ApplyForm";

// Read at request time: the closing date and `?s=` depend on the request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apply to join the TA Board | Tshiamiso Astronauts",
  description: "Apply to join the Board of Tshiamiso Astronauts by Friday 27 November 2026.",
  alternates: { canonical: "https://tshiamisoastronauts.org/board/apply" },
  // The front door is /board. The form pages are not meant to appear in search results.
  robots: { index: false, follow: true },
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const source = resolveBoardSource(params.s);
  const { state, overridden } = resolveBoardState(params.state);
  // After closing, the forms are gone and /board shows the closed message.
  if (state === "closed") redirect(boardPath("/board", source, overridden ? state : undefined));

  return (
    <article className="pb-16">
      <PageHero
        title="Apply to join the TA Board"
        intro="Tshiamiso Astronauts is building a Board for the Year of Breakthrough. Applications close Friday 27 November 2026. Takes about 10 minutes. Directors meet one Saturday a month, serve a 5-year term and are unpaid."
        backHref={boardPath("/board", source)}
      />
      <div className="mt-8 bg-gray-50 py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <ApplyForm source={source} />
        </div>
      </div>
    </article>
  );
}
