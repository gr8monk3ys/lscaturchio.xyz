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
