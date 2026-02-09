import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The University Is a Credentialing Machine",
  description: "Higher education stopped being about knowledge long ago. It's a sorting mechanism for employers, and the content is incidental to the credential.",
  date: "2025-11-10",
  image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80",
  tags: ["education", "institutions", "credentials", "economics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
