/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // CSP: 'unsafe-inline'/'unsafe-eval' are required by Next.js for hydration
    // and Tailwind inline styles.  The remaining directives (form-action,
    // frame-ancestors, object-src, base-uri) provide meaningful protection
    // regardless and do not need nonces.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://www.tshiamisoastronauts.org https://*.hubspot.net https://*.hubspotusercontent.com",
      "font-src 'self'",
      "connect-src 'self' https://api.monday.com",
      "form-action 'self' https://www.payfast.co.za",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HSTS: 2-year max-age, include subdomains
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.tshiamisoastronauts.org",
      },
      {
        protocol: "https",
        hostname: "22500830.fs1.hubspotusercontent-na1.net",
      },
    ],
  },
};

export default nextConfig;
