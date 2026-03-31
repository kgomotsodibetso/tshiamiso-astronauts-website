import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Tshiamiso Astronauts",
  description:
    "Get in touch with Tshiamiso Astronauts NPC — for general enquiries, partnerships, media, volunteering, or donations.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
