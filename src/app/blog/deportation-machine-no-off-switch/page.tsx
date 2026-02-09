import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The Deportation Machine Has No Off Switch",
  description: "Once built, enforcement systems don't stay confined to their original targets. Institutional momentum ensures the machine keeps running.",
  date: "2025-12-01",
  image: "https://images.unsplash.com/photo-1569025743873-ea3a9ber40e6?w=1200&q=80",
  tags: ["politics", "immigration", "institutions", "united-states"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
