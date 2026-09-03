import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/journalism-dead-long-live-journalism");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="journalism-dead-long-live-journalism">
      <Content />
    </BlogLayout>
  );
}
