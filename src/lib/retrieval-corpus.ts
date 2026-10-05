/**
 * Derives the chat retrieval corpus (public/my-data/blog-*.md) from the
 * canonical essays in src/app/blog/<slug>/content.mdx.
 *
 * The corpus files are generated artifacts — never hand-edit them. Run
 * `npm run sync-retrieval-corpus` after changing any essay; CI fails when the
 * corpus drifts from the source (`--check`).
 *
 * This module owns the corpus file-name codec; the essay text itself is
 * `EssaySource.body`, derived once in `essay-sources.ts`.
 */

export const CORPUS_PREFIX = "blog-";

export function corpusFileName(slug: string): string {
  return `${CORPUS_PREFIX}${slug}.md`;
}

export function slugFromCorpusFileName(fileName: string): string | null {
  if (!fileName.startsWith(CORPUS_PREFIX) || !fileName.endsWith(".md")) return null;
  return fileName.slice(CORPUS_PREFIX.length, -".md".length);
}

/**
 * A corpus document is the essay's real title as an H1, then its plain body
 * (`EssaySource.body`).
 */
export function buildCorpusDocument(title: string, body: string): string {
  return `# ${title}\n\n${body}\n`;
}
