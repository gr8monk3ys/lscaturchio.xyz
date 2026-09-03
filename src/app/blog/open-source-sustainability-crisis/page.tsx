import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/open-source-sustainability-crisis");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="open-source-sustainability-crisis">
      <Content />
    </BlogLayout>
  );
}
