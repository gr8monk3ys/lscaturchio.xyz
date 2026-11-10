import { redirect } from "next/navigation";

import {
  readPageParam,
  readSearchParam,
  type SearchParamValue,
} from "@/lib/search-params";

import { BlogIndex, blogIndexMetadata } from "../BlogIndex";

// The canonical URL stays `/blog`: this route is where a filtered `/blog`
// request is rendered, not a second address for the index.
export const generateMetadata = blogIndexMetadata;

/**
 * The filtered writing index: `/blog?tag=` and `/blog?stage=`, rewritten here
 * by `src/proxy.ts`. It reads the query string, so it renders per request;
 * that cost used to be paid by every visit to `/blog`.
 */
export default async function BlogArchive({
  searchParams,
}: {
  searchParams?: Promise<Record<string, SearchParamValue>>;
}) {
  const params = (await searchParams) ?? {};
  const tagFilter = readSearchParam(params, "tag");
  const stageFilter = readSearchParam(params, "stage");

  // Nothing to filter by: this is the index, which has one address.
  if (!tagFilter.trim() && !stageFilter) redirect("/blog");

  return (
    <BlogIndex
      tagFilter={tagFilter}
      stageFilter={stageFilter}
      requestedPage={readPageParam(params)}
    />
  );
}
