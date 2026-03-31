import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Volunteer | Tshiamiso Astronauts",
  description:
    "Give your time and skills to Tshiamiso Astronauts — volunteer as a tutor, mentor, event helper, or fundraiser in Evaton West.",
};

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
