import type { Metadata } from "next";
import SubscribeForm from "@/components/subscribe/SubscribeForm";

export const metadata: Metadata = {
  title: "Subscribe | Tshiamiso Astronauts",
  description:
    "Get learner stories, event invitations and ways to help from Tshiamiso Astronauts in Evaton West. Choose what you would like to hear about.",
  alternates: { canonical: "https://tshiamisoastronauts.org/subscribe" },
  openGraph: {
    title: "Subscribe | Tshiamiso Astronauts",
    description: "Learner stories, event invitations and ways to help, from Evaton West.",
    url: "https://tshiamisoastronauts.org/subscribe",
    siteName: "Tshiamiso Astronauts NPC",
    images: [{ url: "/images/social/social-media.png", width: 1200, height: 630, alt: "Tshiamiso Astronauts" }],
    locale: "en_ZA",
    type: "website",
  },
};

export default function SubscribePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-navy to-brand-teal px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-light-teal">Stay in touch</p>
          <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">
            Subscribe to <span className="text-brand-orange">Tshiamiso Astronauts</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-gray-100">
            Learner stories, event invitations and ways to help, straight from Evaton West.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-xl rounded-2xl bg-brand-card p-6 sm:p-8">
          <h2 className="text-xl font-bold text-brand-navy">Choose what you would like to hear about</h2>
          <p className="mb-6 mt-2 text-sm leading-relaxed text-brand-navy">
            We will send one email first to check it is really you. Tap Confirm in that email and you are on the list.
          </p>
          <SubscribeForm variant="full" placement="subscribe-page" />
        </div>
      </section>
    </>
  );
}
