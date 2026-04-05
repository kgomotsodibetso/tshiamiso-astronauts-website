import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate | Tshiamiso Astronauts",
  description:
    "Support literacy and education in Evaton West. Your donation funds books, tutors, and digital access for learners through Tshiamiso Astronauts NPC.",
  openGraph: {
    title: "Donate | Tshiamiso Astronauts",
    description:
      "Support literacy and education in Evaton West. Your donation funds books, tutors, and digital access for learners through Tshiamiso Astronauts NPC.",
    url: "https://tshiamisoastronauts.org/donate",
    siteName: "Tshiamiso Astronauts NPC",
    images: [{ url: "/images/social/social-media.png", width: 1200, height: 630, alt: "Tshiamiso Astronauts — Literacy & Education NPO" }],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donate | Tshiamiso Astronauts",
    description:
      "Support literacy and education in Evaton West. Your donation funds books, tutors, and digital access for learners through Tshiamiso Astronauts NPC.",
    images: ["/images/social/social-media.png"],
  },
};

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
