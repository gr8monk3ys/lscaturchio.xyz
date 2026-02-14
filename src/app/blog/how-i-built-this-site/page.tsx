import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta);

export default function Page() {
  return (
    <BlogLayout meta={meta} readingTime={15}>
      <Content />
    </BlogLayout>
  );
}
