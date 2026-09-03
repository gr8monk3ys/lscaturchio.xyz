import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/degrowth-isnt-primitivism");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="degrowth-isnt-primitivism">
      <Content />
    </BlogLayout>
  );
}
