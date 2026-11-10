/**
 * The one builder for a `/blog` archive URL.
 *
 * It lived as a private function inside `BlogGrid`, which was fine while the
 * grid owned the only controls that produced these links. The page header now
 * owns the single stage filter — there used to be two, disagreeing about their
 * own selected state — and it needs the same builder, because the header's
 * links were hand-written as `/blog?stage=X` and silently dropped an active
 * tag filter.
 *
 * Page 1 is omitted rather than written as `?page=1`, so the canonical URL for
 * an unfiltered archive is `/blog` and not three spellings of it.
 */
export function getBlogArchiveHref(
  page: number,
  tagFilter: string,
  stageFilter: string
): string {
  const params = new URLSearchParams();

  if (tagFilter) {
    params.set("tag", tagFilter);
  }

  if (stageFilter) {
    params.set("stage", stageFilter);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

/** Where a filtered index is rendered. Readers never see this path. */
export const BLOG_ARCHIVE_PATH = "/blog/archive";

/**
 * The route that renders a `/blog` request.
 *
 * `/blog` is prerendered, so it cannot read the query string. A request that
 * carries a tag or a stage is rendered by the archive route instead; the
 * proxy rewrites to it, so the address bar keeps the `/blog?stage=` form that
 * `getBlogArchiveHref` builds. `?page=` alone is not a filter: the unfiltered
 * index is not paginated.
 */
export function resolveBlogIndexPath(pathname: string, searchParams: URLSearchParams): string {
  if (pathname !== "/blog" && pathname !== "/blog/") return pathname;
  const filtered = Boolean(searchParams.get("tag") || searchParams.get("stage"));
  return filtered ? BLOG_ARCHIVE_PATH : pathname;
}
