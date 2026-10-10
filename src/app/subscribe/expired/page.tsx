import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Link expired | Tshiamiso Astronauts",
  robots: { index: false, follow: false },
};

export default function ExpiredPage() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-xl text-center text-brand-navy">
        <h1 className="text-3xl font-bold md:text-4xl">This link has expired.</h1>
        <p className="mt-5 text-lg leading-relaxed">Please sign up again and we will send you a new one.</p>
        <Link
          href="/subscribe"
          className="mt-8 inline-block min-h-[44px] rounded-lg bg-brand-orange px-8 py-3 font-bold text-brand-navy hover:opacity-90"
        >
          Subscribe
        </Link>
      </div>
    </section>
  );
}
