import Link from "next/link";

export default function ThankYouPage() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-24 bg-brand-white">
      <div className="max-w-xl text-center">
        <div className="text-6xl mb-6">🚀</div>
        <h1 className="text-4xl md:text-5xl font-bold text-brand-navy mb-4">
          Thank You!
        </h1>
        <p className="text-brand-teal text-xl font-semibold mb-4">
          Your donation has been received.
        </p>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">
          On behalf of every learner in Evaton West, thank you for believing in
          the power of literacy. Your generosity makes our work possible.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          A <strong>Section 18A tax receipt</strong> will be emailed to you
          shortly at the address you provided. If you do not receive it within
          48 hours, please contact us at{" "}
          <a
            href="mailto:info@tshiamisoastronauts.org"
            className="text-brand-orange hover:underline"
          >
            info@tshiamisoastronauts.org
          </a>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-brand-navy text-white font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
          <Link
            href="/programmes"
            className="border-2 border-brand-teal text-brand-teal font-bold px-8 py-3 rounded-lg hover:bg-brand-teal hover:text-white transition-colors"
          >
            See Our Programmes
          </Link>
        </div>
      </div>
    </section>
  );
}
