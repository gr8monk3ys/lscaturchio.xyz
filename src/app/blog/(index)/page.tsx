import { BlogIndex, blogIndexMetadata } from "./BlogIndex";

export const generateMetadata = blogIndexMetadata;

// Prerendered, and rebuilt at most hourly so a scheduled essay appears on its
// date without a deploy.
//
// This only holds while the page reads no `searchParams`. It used to: the
// `revalidate` below was already here, and did nothing, because one `await
// searchParams` made every visit to the site's main index a server render
// (`Cache-Control: no-store`, about 6 s on a cold function). The filtered
// views now live at `/blog/archive`, and `src/proxy.ts` sends `/blog?tag=` and
// `/blog?stage=` there, so the URLs readers see are unchanged.
export const revalidate = 3600;

export default function Blog() {
  return <BlogIndex tagFilter="" stageFilter="" requestedPage={1} />;
}
