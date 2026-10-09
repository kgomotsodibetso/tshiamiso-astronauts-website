/** @type {import('next').NextConfig} */
const nextConfig = {
  // Markdown blog posts are read from disk at runtime (ISR), so make sure they ship with the routes.
  outputFileTracingIncludes: {
    "/blog": ["./content/blog/**/*", "./public/images/blog/**/*"],
    "/blog/[slug]": ["./content/blog/**/*", "./public/images/blog/**/*"],
    "/sitemap.xml": ["./content/blog/**/*"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    // Old HubSpot site URLs, kept alive so existing links and search results still work.
    return [
      { source: "/tshiamiso-astronauts-blog", destination: "/blog", permanent: true },
      { source: "/tshiamiso-astronauts-blog/tag/:tag", destination: "/blog", permanent: true },
      { source: "/tshiamiso-astronauts-blog/author/:author", destination: "/blog", permanent: true },
      { source: "/tshiamiso-astronauts-blog/rss.xml", destination: "/blog", permanent: true },
      { source: "/tshiamiso-astronauts-blog/:slug", destination: "/blog/:slug", permanent: true },
      { source: "/inspiring-a-love-for-reading", destination: "/about", permanent: true },
      { source: "/empowering-kids-in-reading-literacy-programs", destination: "/programmes", permanent: true },
      { source: "/connect-with-readers-tshiamiso-astronauts", destination: "/events", permanent: true },
      { source: "/support-literacy-and-learning-for-the-youth-volunteer", destination: "/volunteer", permanent: true },
      { source: "/get-in-touch-support-literacy", destination: "/contact", permanent: true },
      { source: "/support-our-cause-your-donation-matters", destination: "/donate", permanent: true },
    ];
  },
  async rewrites() {
    // Old image links (https://www.tshiamisoastronauts.org/hubfs/...) keep working via the HubSpot CDN.
    return [
      {
        source: "/hubfs/:path*",
        destination: "https://22500830.fs1.hubspotusercontent-na2.net/hubfs/22500830/:path*",
      },
    ];
  },
  async headers() {
    // CSP: 'unsafe-inline'/'unsafe-eval' are required by Next.js for hydration
    // and Tailwind inline styles.  The remaining directives (form-action,
    // frame-ancestors, object-src, base-uri) provide meaningful protection
    // regardless and do not need nonces.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://www.tshiamisoastronauts.org https://*.hubspot.net https://*.hubspotusercontent.com https://*.hubspotusercontent-na1.net https://*.hubspotusercontent-na2.net https://www.google.com https://www.google.co.za https://googleads.g.doubleclick.net https://*.g.doubleclick.net",
      "font-src 'self'",
      "connect-src 'self' https://api.monday.com https://api.resend.com https://api.twilio.com https://www.google.com https://www.google.co.za https://www.googleadservices.com https://googleads.g.doubleclick.net https://*.g.doubleclick.net https://*.google-analytics.com https://*.analytics.google.com",
      "form-action 'self' https://www.payfast.co.za https://payment.payfast.io",
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
      {
        protocol: "https",
        hostname: "22500830.fs1.hubspotusercontent-na2.net",
      },
    ],
  },
};

export default nextConfig;
