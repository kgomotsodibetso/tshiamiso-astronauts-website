import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Tshiamiso Astronauts",
};

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-24 bg-brand-white">
      <div className="max-w-xl text-center">
        <p className="text-brand-orange font-bold text-sm uppercase tracking-widest mb-4">
          404 — Page Not Found
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-brand-navy mb-4">
          Lost in Space?
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          The page you are looking for doesn&apos;t exist or may have moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-brand-navy text-white font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="border-2 border-brand-teal text-brand-teal font-bold px-8 py-3 rounded-lg hover:bg-brand-teal hover:text-white transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
