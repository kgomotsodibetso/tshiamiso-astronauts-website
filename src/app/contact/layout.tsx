import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Tshiamiso Astronauts",
  description:
    "Get in touch with Tshiamiso Astronauts NPC — for general enquiries, partnerships, media, volunteering, or donations.",
  openGraph: {
    title: "Contact Us | Tshiamiso Astronauts",
    description:
      "Get in touch with Tshiamiso Astronauts NPC — for general enquiries, partnerships, media, volunteering, or donations.",
    url: "https://tshiamisoastronauts.org/contact",
    siteName: "Tshiamiso Astronauts NPC",
    images: [{ url: "/images/social/social-media.png", width: 1200, height: 630, alt: "Tshiamiso Astronauts — Literacy & Education NPO" }],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Tshiamiso Astronauts",
    description:
      "Get in touch with Tshiamiso Astronauts NPC — for general enquiries, partnerships, media, volunteering, or donations.",
    images: ["/images/social/social-media.png"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
