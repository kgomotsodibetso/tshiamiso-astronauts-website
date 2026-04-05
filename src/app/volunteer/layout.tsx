import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Volunteer | Tshiamiso Astronauts",
  description:
    "Give your time and skills to Tshiamiso Astronauts — volunteer as a tutor, mentor, event helper, or fundraiser in Evaton West.",
  openGraph: {
    title: "Volunteer | Tshiamiso Astronauts",
    description:
      "Give your time and skills to Tshiamiso Astronauts — volunteer as a tutor, mentor, event helper, or fundraiser in Evaton West.",
    url: "https://tshiamisoastronauts.org/volunteer",
    siteName: "Tshiamiso Astronauts NPC",
    images: [{ url: "/images/social/social-media.png", width: 1200, height: 630, alt: "Tshiamiso Astronauts — Literacy & Education NPO" }],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Volunteer | Tshiamiso Astronauts",
    description:
      "Give your time and skills to Tshiamiso Astronauts — volunteer as a tutor, mentor, event helper, or fundraiser in Evaton West.",
    images: ["/images/social/social-media.png"],
  },
};

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
