import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/how-i-built-this-site");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="how-i-built-this-site">
      <Content />
    </BlogLayout>
  );
}
