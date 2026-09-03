import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/secular-society-isnt");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="secular-society-isnt">
      <Content />
    </BlogLayout>
  );
}
