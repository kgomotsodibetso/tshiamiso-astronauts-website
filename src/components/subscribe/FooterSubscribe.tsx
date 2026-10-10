"use client";

import { usePathname } from "next/navigation";
import SubscribeForm from "./SubscribeForm";

// Newsletter-only strip above the footer on every page, except the pages that already are the form.
export default function FooterSubscribe() {
  const pathname = usePathname();
  if (pathname?.startsWith("/subscribe")) return null;

  return (
    <section aria-labelledby="footer-subscribe-title" className="bg-brand-card px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-5 lg:items-center">
        <div className="lg:col-span-2">
          <h2 id="footer-subscribe-title" className="text-2xl font-bold text-brand-navy">Stay in the loop.</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-navy">
            One short email a month with learner stories, events and ways to help.
          </p>
        </div>
        <div className="lg:col-span-3">
          <SubscribeForm variant="short" placement="footer" />
        </div>
      </div>
    </section>
  );
}
