/**
 * Reading Next's `searchParams`.
 *
 * A route receives `Record<string, string | string[] | undefined>`, and every
 * page that reads it has to collapse the array case and the missing case to
 * something usable. Five pages each carried a private copy of that unwrapping
 * plus its own redeclared type; two of them also carried their own
 * allowed-value narrowing, which put the sort and category whitelists out of
 * reach of any test that did not render a page.
 */

export type SearchParamValue = string | string[] | undefined;

export type SearchParams = Record<string, SearchParamValue>;

/**
 * One parameter as a string. A repeated parameter takes its first value,
 * because every reader here wants a single answer, and an absent one reads
 * as empty rather than undefined so callers can `.trim()` without a guard.
 */
export function readSearchParam(params: SearchParams, key: string): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/**
 * A 1-based page number. Anything unparseable, zero, or negative is page 1:
 * a bad `?page=` should show the first page, never an empty list.
 */
export function readPageParam(params: SearchParams, key = "page"): number {
  const page = Number.parseInt(readSearchParam(params, key), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/**
 * One parameter narrowed to a known set, or the fallback. This is the shape
 * every "normalize this filter" helper had: a whitelist and a default.
 */
export function readEnumParam<T extends string>(
  params: SearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T
): T {
  const value = readSearchParam(params, key);
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}
