import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/donate/thank-you",
          "/api/",
        ],
      },
    ],
    sitemap: "https://tshiamisoastronauts.org/sitemap.xml",
  };
}
