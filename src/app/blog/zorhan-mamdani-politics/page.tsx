import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "What If Socialists Won New York? A Political Scenario",
  description:
    "Speculative political fiction: How a DSA assemblyman could defeat Andrew Cuomo with grassroots organizing, and what it would mean for American politics.",
  date: "2026-01-10",
  image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",
  tags: ["politics", "socialism", "organizing", "DSA", "new-york", "speculative-fiction"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
