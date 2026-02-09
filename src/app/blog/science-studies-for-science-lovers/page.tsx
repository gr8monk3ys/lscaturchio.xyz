import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "Science Studies for People Who Like Science",
  description: "The social construction of scientific facts doesn't mean they're not real. It means they're more interesting. Science studies enriches rather than undermines science.",
  date: "2025-10-27",
  image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=80",
  tags: ["epistemology", "science", "philosophy", "sociology"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
