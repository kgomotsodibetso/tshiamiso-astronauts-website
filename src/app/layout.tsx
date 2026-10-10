import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
      <body className={`${montserrat.variable} font-sans antialiased bg-brand-white text-brand-navy`}>
        <Navigation />
        <main id="main-content" className="pt-16">{children}</main>
        <Footer />
        <CookieBanner />
        <SpeedInsights />
        {process.env.VERCEL_ENV === "production" && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "yvjvmf0lhi");`}
          </Script>
        )}
      </body>
    </html>
  );
}
