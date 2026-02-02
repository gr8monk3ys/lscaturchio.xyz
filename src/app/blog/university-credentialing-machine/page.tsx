import { BlogLayout } from "@/components/blog/BlogLayout";
import Content from "./content.mdx";

const meta = {
  title: "The University Is a Credentialing Machine",
  description: "Higher education stopped being about knowledge long ago. It's a sorting mechanism for employers, and the content is incidental to the credential.",
  date: "2025-11-10",
  image: "/images/blog/default.webp",
  tags: ["education", "institutions", "credentials", "economics"],
};

export default function Page() {
  return (
    <BlogLayout meta={meta}>
      <Content />
    </BlogLayout>
  );
}
