import type { Metadata } from "next";

const TITLE = "Join the TA Board | Tshiamiso Astronauts";
const DESCRIPTION =
  "Tshiamiso Astronauts is opening seats on its Board. Apply or nominate someone by Friday 27 November 2026.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // One canonical address, so ?s= links from the poster, cards and emails do not split the page in search.
  alternates: { canonical: "https://tshiamisoastronauts.org/board" },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://tshiamisoastronauts.org/board",
    siteName: "Tshiamiso Astronauts NPC",
    images: [{ url: "/images/social/social-media.png", width: 1200, height: 630, alt: "Tshiamiso Astronauts — Literacy & Education NPO" }],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/social/social-media.png"],
  },
};

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
