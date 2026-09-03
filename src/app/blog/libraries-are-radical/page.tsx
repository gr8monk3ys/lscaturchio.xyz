import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/libraries-are-radical");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="libraries-are-radical">
      <Content />
    </BlogLayout>
  );
}
