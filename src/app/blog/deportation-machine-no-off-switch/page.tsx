import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Deportation Machine Has No Off Switch",
  description: "Once built, enforcement systems don't stay confined to their original targets. Institutional momentum ensures the machine keeps running.",
  date: "2025-12-01",
  image: "/images/blog/default.webp",
  tags: ["politics", "immigration", "institutions", "united-states"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
