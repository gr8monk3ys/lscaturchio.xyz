import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lscaturchio.xyz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/secret", "/unsubscribe"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

