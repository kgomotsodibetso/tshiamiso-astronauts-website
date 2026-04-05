import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-brand-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & tagline */}
          <div>
            <Link href="/" className="inline-block">
              <div className="bg-white rounded-xl px-4 py-3 inline-block">
                <Image
                  src="/images/logos/logo-full.png"
                  alt="Tshiamiso Astronauts"
                  width={180}
                  height={56}
                  className="h-14 w-auto"
                />
              </div>
            </Link>
            <p className="text-brand-light-teal text-sm mt-3">
              Literacy &amp; Lifelong Learning
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Evaton West, Gauteng, South Africa
            </p>
          </div>

          {/* Registration info */}
          <div>
            <h3 className="text-brand-orange font-semibold text-sm uppercase tracking-wider mb-3">
              Registration
            </h3>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>NPO: 294-255</li>
              <li>PBO: 930083956</li>
              <li>Section 18A Approved</li>
              <li className="pt-2 text-brand-light-teal">
                B-BBEE Level One
              </li>
              <li className="text-gray-400 text-xs">
                135% procurement recognition
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-brand-orange font-semibold text-sm uppercase tracking-wider mb-3">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a
                  href="mailto:info@tshiamisoastronauts.org"
                  className="hover:text-brand-orange transition-colors"
                >
                  info@tshiamisoastronauts.org
                </a>
              </li>
              <li>
                <a
                  href="tel:+27660715426"
                  className="hover:text-brand-orange transition-colors"
                >
                  +27 66 071 5426
                </a>
              </li>
            </ul>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/donate"
                className="inline-block bg-brand-orange text-white text-sm font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-center"
              >
                Donate Now
              </Link>
              <Link
                href="/volunteer"
                className="inline-block border border-brand-teal text-brand-light-teal text-sm font-semibold px-4 py-2 rounded-md hover:bg-brand-teal hover:text-white transition-colors text-center"
              >
                Volunteer
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 text-center text-xs text-gray-500">
          &copy; 2026 Tshiamiso Astronauts NPC. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
