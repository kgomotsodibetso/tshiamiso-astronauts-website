"use client";

import { OPEN_COOKIE_SETTINGS_EVENT } from "@/config/consent";

// Footer link that reopens the cookie choices, so consent can be withdrawn as easily as it was given.
export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
      className="min-h-[44px] px-1 text-gray-300 underline transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-light-teal sm:min-h-0"
    >
      Cookie settings
    </button>
  );
}
