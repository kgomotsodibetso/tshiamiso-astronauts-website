import type { Metadata } from "next";
import { BOARD_CLOSE_DATE } from "@/config/board";

const TITLE = "Join the TA Board | Tshiamiso Astronauts";
// Used for the meta description, Open Graph and Twitter text. The date comes from src/config/board.ts.
const DESCRIPTION = `Tshiamiso Astronauts is opening seats on its Board. Apply or nominate someone by ${BOARD_CLOSE_DATE}.`;

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
