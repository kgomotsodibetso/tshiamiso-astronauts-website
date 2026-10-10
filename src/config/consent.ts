// Cookie consent for Google Ads measurement (Google Consent Mode v2).
// One choice covers all four Google consent signals. The choice is kept on the visitor's device only
// (localStorage), with no personal data.

export const CONSENT_STORAGE_KEY = "ta_consent";
export const CONSENT_VERSION = 1;
// Bump COPY_VERSION when the banner wording changes materially, to ask returning visitors again.
export const OPEN_COOKIE_SETTINGS_EVENT = "ta:open-cookie-settings";
export const COOKIE_ACK_EVENT = "ta:cookie-ack";

export const GOOGLE_CONSENT_SIGNALS = [
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "analytics_storage",
] as const;

// Visitors in these places start with everything switched off until they accept. Google works out
// the visitor's country itself, so we do not need our own location lookup.
// The EEA (EU member states plus Iceland, Liechtenstein and Norway) and the United Kingdom, as approved
// for the privacy policy. Switzerland is not included; add "CH" here if you decide to treat it the same way.
export const CONSENT_DEFAULT_DENIED_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT",
  "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB",
] as const;

export interface StoredConsent {
  v: number;
  ads: boolean;
  at: string;
}
