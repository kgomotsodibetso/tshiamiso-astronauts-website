import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TOKEN_TTL_MS } from "@/config/subscribe";
import type { ConfirmPayload } from "@/lib/subscribe/confirm";
import { openToken } from "@/lib/subscribe/token";

export const metadata: Metadata = {
  title: "Confirm your subscription | Tshiamiso Astronauts",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

// The link in the confirmation email lands here. Opening it changes nothing: it only shows a button.
// Email scanners and link previews open links on their own, so the sign-up is only saved when a person
// presses "Confirm my subscription" (POST to /subscribe/confirm/complete).
export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const opened = t && t.length <= 4096 ? openToken<ConfirmPayload>(t, "confirm", TOKEN_TTL_MS) : null;
  if (!opened?.ok) redirect("/subscribe/expired");

  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-xl text-center text-brand-navy">
        <h1 className="text-3xl font-bold md:text-4xl">One last step</h1>
        <p className="mt-5 text-lg leading-relaxed">
          Hi {opened.data.firstName}, press the button to finish subscribing to Tshiamiso Astronauts.
        </p>
        <form method="post" action="/subscribe/confirm/complete" className="mt-8">
          <input type="hidden" name="t" value={t} />
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
