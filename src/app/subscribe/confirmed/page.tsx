import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { CONFIRMED_COOKIE } from "@/lib/subscribe/cookies";
import { openToken } from "@/lib/subscribe/token";

export const metadata: Metadata = {
  title: "You are on the list | Tshiamiso Astronauts",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ConfirmedPage() {
  const jar = await cookies();
  const c = jar.get(CONFIRMED_COOKIE)?.value;
  const opened = c && c.length < 2048 ? openToken<{ n?: string; a?: boolean }>(c, "confirmed", 15 * 60 * 1000) : null;
  const name = opened?.ok ? opened.data.n : undefined;
  const already = opened?.ok ? opened.data.a === true : false;

  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-xl text-center text-brand-navy">
        <h1 className="text-3xl font-bold md:text-4xl">{already ? "Your choices are updated." : "You are on the list."}</h1>
        <p className="mt-5 text-lg leading-relaxed">
          Thank you{name ? `, ${name}` : ""}.{" "}
          {already
            ? "You were already on our list, so we have updated what you get."
            : "A welcome email is on its way. Want to choose exactly what you get? Use the link in that email."}
        </p>
        <Link
          href="/blog"
          className="mt-8 inline-block min-h-[44px] rounded-lg bg-brand-navy px-8 py-3 font-bold text-white hover:opacity-90"
        >
          Read our latest stories
        </Link>
      </div>
    </section>
  );
}
