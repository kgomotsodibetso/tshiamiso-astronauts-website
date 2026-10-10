import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { consentInitScript } from "@/lib/consent";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tshiamisoastronauts.org"),
  title: "Tshiamiso Astronauts NPC",
  description:
    "Tshiamiso Astronauts NPC — A South African literacy non-profit organisation based in Evaton West, Gauteng.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Consent Mode defaults. Must run before the Google tag, so it sits first in <head>. */}
        <script dangerouslySetInnerHTML={{ __html: consentInitScript() }} />
      </head>
      <body className={`${montserrat.variable} font-sans antialiased bg-brand-white text-brand-navy`}>
        {/* First in the page order so keyboard and screen-reader users meet the cookie choices straight away.
            It is fixed to the bottom of the screen, so it still looks like a bottom banner. */}
        <CookieBanner />
        <Navigation />
        <main id="main-content" className="pt-16">{children}</main>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}
