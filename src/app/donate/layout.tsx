import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate | Tshiamiso Astronauts",
  description:
    "Support literacy and education in Evaton West. Your donation funds books, tutors, and digital access for learners through Tshiamiso Astronauts NPC.",
};

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
