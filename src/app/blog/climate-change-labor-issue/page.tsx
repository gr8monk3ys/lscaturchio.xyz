import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Climate Change Is a Labor Issue",
  description: "The workers who extract, transport, and burn fossil fuels are the same ones who'll build what comes next. Climate transition requires labor organizing.",
  date: "2025-09-08",
  image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&q=80",
  tags: ["climate", "labor", "politics", "environment"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
