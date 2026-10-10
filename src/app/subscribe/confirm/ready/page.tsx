import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TOKEN_TTL_MS } from "@/config/subscribe";
import type { ConfirmPayload } from "@/lib/subscribe/confirm";
import { CONFIRM_COOKIE } from "@/lib/subscribe/cookies";
import { openToken } from "@/lib/subscribe/token";

export const metadata: Metadata = {
  title: "Confirm your subscription | Tshiamiso Astronauts",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

// Shows a button and nothing else. Email scanners and link previews open links on their own, so the
// sign-up is only saved when a person presses "Confirm my subscription" (POST to /subscribe/confirm/complete).
// The token comes from a cookie, never from the page address.
export default async function ConfirmReadyPage() {
  const jar = await cookies();
  const t = jar.get(CONFIRM_COOKIE)?.value;

  if (!t) {
    return (
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-xl text-center text-brand-navy">
          <h1 className="text-3xl font-bold md:text-4xl">We could not open your link</h1>
          <p className="mt-5 text-lg leading-relaxed">
            This usually means your browser is blocking cookies for this site, or the link was opened a while ago.
            Please allow cookies for this site and open the link in your email again, or sign up again and we will
            send you a new one.
          </p>
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

  const opened = openToken<ConfirmPayload>(t, "confirm", TOKEN_TTL_MS);
  if (!opened.ok) redirect("/subscribe/expired");

  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-xl text-center text-brand-navy">
        <h1 className="text-3xl font-bold md:text-4xl">One last step</h1>
        <p className="mt-5 text-lg leading-relaxed">
          Hi {opened.data.firstName}, press the button to finish subscribing to Tshiamiso Astronauts.
        </p>
        <form method="post" action="/subscribe/confirm/complete" className="mt-8">
          <button
            type="submit"
            className="min-h-[44px] rounded-lg bg-brand-orange px-8 py-3 text-lg font-bold text-brand-navy transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
          >
            Confirm my subscription
          </button>
        </form>
        <p className="mt-6 text-sm">If this was not you, close this page. Nothing will be saved.</p>
      </div>
    </section>
  );
}
