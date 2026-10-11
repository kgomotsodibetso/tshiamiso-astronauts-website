import type { Metadata } from "next";
import Link from "next/link";
import { SUPPORT_EMAIL } from "@/config/join";

// This is where the sign-up form sends families after they submit. It must never appear in search results.
export const metadata: Metadata = {
  title: "Thank you | Tshiamiso Astronauts",
  robots: { index: false, follow: false },
};

export default function JoinThanksPage() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-xl text-center text-brand-navy">
        <h1 className="text-3xl font-bold md:text-4xl">Thank you. We have your details.</h1>
        <p className="mt-5 text-lg leading-relaxed">
          Someone from Tshiamiso Astronauts will call you within 7 days to talk about your family and book a taster
          session.
        </p>
        <p className="mt-4 leading-relaxed">
          Need to change something, or have a question? Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
        <Link
          href="/programmes"
          className="mt-8 inline-flex min-h-[44px] items-center rounded-lg bg-brand-navy px-8 py-3 font-bold text-white hover:opacity-90"
        >
          See our programmes
        </Link>
      </div>
    </section>
  );
}
