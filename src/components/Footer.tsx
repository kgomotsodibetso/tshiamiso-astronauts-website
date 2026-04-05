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
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.facebook.com/TshiamisoAstronauts/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-gray-400 hover:text-brand-orange transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/tshiamisoastronauts/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-400 hover:text-brand-orange transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/tshiamiso-astronauts/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-400 hover:text-brand-orange transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
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
