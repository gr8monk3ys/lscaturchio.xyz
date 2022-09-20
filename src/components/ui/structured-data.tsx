function JsonLdScript({
  id,
  data,
}: {
  id: string;
  data: Record<string, unknown>;
}) {
  return (
    <script id={id} type="application/ld+json">
      {JSON.stringify(data)}
    </script>
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

  return <JsonLdScript id="breadcrumb-schema" data={jsonLd} />;
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

  return <JsonLdScript id="faq-schema" data={jsonLd} />;
}
