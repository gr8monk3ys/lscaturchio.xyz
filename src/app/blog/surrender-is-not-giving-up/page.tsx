import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Surrender Is Not Giving Up",
  description: "The counterintuitive power of letting go while maintaining discipline. Why surrender and defeat are fundamentally different things.",
  date: "2026-01-12",
  image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80",
  tags: ["philosophy", "stoicism", "acceptance", "growth"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
