import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Prison System Isn't Broken",
  description: "Mass incarceration, racial disparities, and brutal recidivism rates aren't system failures. They're system features.",
  date: "2026-02-26",
  image: "/images/blog/default.webp",
  tags: ["politics", "justice", "institutions", "united-states"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
