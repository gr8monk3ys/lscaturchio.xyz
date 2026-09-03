import { BlogLayout } from "@/components/blog/BlogLayout";
import Content, { meta } from "./content.mdx";

import { buildBlogMetadata } from "@/lib/seo";
export const metadata = buildBlogMetadata(meta, "/blog/why-your-city-is-expensive");

export default function Page() {
  return (
    <BlogLayout meta={meta} slug="why-your-city-is-expensive">
      <Content />
    </BlogLayout>
  );
}
