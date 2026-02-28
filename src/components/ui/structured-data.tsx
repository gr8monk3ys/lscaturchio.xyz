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
    <script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
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

const EMPTY_SAME_AS: string[] = [];

export function PersonStructuredData({
  name,
  description,
  image,
  sameAs = EMPTY_SAME_AS,
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
    <script
      id="person-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
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
    <script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
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
    <script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
