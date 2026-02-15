import Script from "next/script";
import { SITE_URL } from "@/lib/site-url";

interface BlogJsonLdProps {
  title: string;
  description: string;
  date: string;
  updated?: string;
  image: string;
  tags: string[];
  url: string;
}

export function BlogJsonLd({
  title,
  description,
  date,
  updated,
  image,
  tags,
  url,
}: BlogJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    image: `${SITE_URL}${image}`,
    datePublished: date,
    ...(updated && { dateModified: updated }),
    author: {
      "@type": "Person",
      name: "Lorenzo Scaturchio",
    },
    publisher: {
      "@type": "Person",
      name: "Lorenzo Scaturchio",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/signature.webp`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: tags.join(", "),
  };

  return (
    <Script id="blog-schema" type="application/ld+json">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
