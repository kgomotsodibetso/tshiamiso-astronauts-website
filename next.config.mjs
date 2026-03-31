/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.tshiamisoastronauts.org",
      },
      {
        protocol: "https",
        hostname: "**.hubspot.net",
      },
      {
        protocol: "https",
        hostname: "**.hubspotusercontent.com",
      },
    ],
  },
};

export default nextConfig;
