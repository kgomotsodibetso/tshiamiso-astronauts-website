"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cleanSource } from "@/lib/join/source";

const BUTTON =
  "inline-flex min-h-[48px] items-center justify-center rounded-lg bg-brand-orange px-8 py-3 text-lg font-bold text-brand-navy hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy";

// A plain link, not next/link: a prefetch must not run the redirect and count a tap that never happened.
// The source is read here, in the browser, so the page itself stays static and fast. Only the cleaned,
// allow-listed value is ever put into the link. The raw ?s= text is never shown or passed on.
function StartLink() {
  const params = useSearchParams();
  const source = cleanSource(params.get("s"));
  return (
    <a href={`/join/start?s=${source}`} className={BUTTON}>
      Tell us about your family
    </a>
  );
}

export default function JoinCta() {
  return (
    <Suspense
      fallback={
        <a href="/join/start?s=other" className={BUTTON}>
          Tell us about your family
        </a>
      }
    >
      <StartLink />
    </Suspense>
  );
}
