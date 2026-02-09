import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Prison System Isn't Broken",
  description: "Mass incarceration, racial disparities, and brutal recidivism rates aren't system failures. They're system features.",
  date: "2026-02-26",
  image: "https://images.unsplash.com/photo-1605806616949-1e87b487fc2f?w=1200&q=80",
  tags: ["politics", "justice", "institutions", "united-states"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
