import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
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
      <body className={`${fredoka.variable} ${nunito.variable} font-sans antialiased bg-brand-white text-brand-navy`}>
        <Navigation />
        <main id="main-content" className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
