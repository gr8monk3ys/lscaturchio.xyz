// Rule: TypeScript Usage - Use TypeScript for all code
"use client";

import { useMemo } from "react";
import Script from "next/script";

interface BlogJsonLdProps {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  images?: string[];
  authorName?: string;
  url: string;
  tags?: string[];
  readingTime?: string;
}

/**
 * Component for adding structured data for blog posts
 * Implements the BlogPosting schema from schema.org
 */
export function BlogJsonLd({
  title,
  description,
  datePublished,
  dateModified,
  images = [],
  authorName = "Lorenzo Scaturchio",
  url,
  tags = [],
  readingTime,
}: BlogJsonLdProps): JSX.Element {
  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": description,
      "image": images.length > 0 ? images : undefined,
      "datePublished": datePublished,
      "dateModified": dateModified || datePublished,
      "author": {
        "@type": "Person",
        "name": authorName,
        "url": "https://lscaturchio.xyz"
      },
      "publisher": {
        "@type": "Person",
        "name": authorName,
        "logo": {
          "@type": "ImageObject",
          "url": "https://lscaturchio.xyz/signature.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url,
      },
      "keywords": tags.join(", "),
      ...(readingTime ? { "timeRequired": readingTime } : {})
    }),
    [title, description, datePublished, dateModified, images, authorName, url, tags, readingTime]
  );

  return (
    <Script 
      id="blog-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      strategy="afterInteractive"
    />
  );
}
