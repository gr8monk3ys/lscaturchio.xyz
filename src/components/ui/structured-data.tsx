"use client";

import Script from "next/script";

interface WebsiteStructuredDataProps {
  url: string;
  name: string;
  description: string;
  siteType?: "WebSite" | "Portfolio" | "Blog" | "Person";
}

export function WebsiteStructuredData({
  url,
  name,
  description,
  siteType = "WebSite",
}: WebsiteStructuredDataProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": siteType,
    name,
    description,
    url,
  };

  return (
    <Script id="website-schema" type="application/ld+json">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}

interface PersonStructuredDataProps {
  name: string;
  description: string;
  image: string;
  sameAs?: string[];
  jobTitle?: string;
  url: string;
}

export function PersonStructuredData({
  name,
  description,
  image,
  sameAs = [],
  jobTitle,
  url,
}: PersonStructuredDataProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description,
    image,
    sameAs,
    jobTitle,
    url,
  };

  return (
    <Script id="person-schema" type="application/ld+json">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}

interface BreadcrumbStructuredDataProps {
  items: {
    name: string;
    item: string;
  }[];
}

export function BreadcrumbStructuredData({
  items,
}: BreadcrumbStructuredDataProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return (
    <Script id="breadcrumb-schema" type="application/ld+json">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}

interface FAQStructuredDataProps {
  questions: {
    question: string;
    answer: string;
  }[];
}

export function FAQStructuredData({ questions }: FAQStructuredDataProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <Script id="faq-schema" type="application/ld+json">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
