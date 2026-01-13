import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Monero in 2026: Technical Advances Meet Regulatory Headwinds",
  description: "An analysis of Monero's position as privacy technology advances with FCMP++ while regulatory pressure triggers unprecedented exchange delistings.",
  date: "2026-01-09",
  image: "/images/blog/monero.webp",
  tags: ["cryptocurrency", "privacy", "Monero", "XMR", "regulation"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
