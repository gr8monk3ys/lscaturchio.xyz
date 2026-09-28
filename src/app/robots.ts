import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // /api/og is every page's og:image. Link-preview bots (X, LinkedIn)
        // obey robots.txt, and the longer Allow beats the /api/ Disallow.
        allow: ["/", "/api/og"],
        disallow: ["/api/", "/secret", "/unsubscribe"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

