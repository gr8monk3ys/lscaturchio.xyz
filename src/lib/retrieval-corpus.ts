/**
 * Derives the chat retrieval corpus (public/my-data/blog-*.md) from the
 * canonical essays in src/app/blog/<slug>/content.mdx.
 *
 * The corpus files are generated artifacts — never hand-edit them. Run
 * `npm run sync-retrieval-corpus` after changing any essay; CI fails when the
 * corpus drifts from the source (`--check`).
 */

export const CORPUS_PREFIX = "blog-";

export function corpusFileName(slug: string): string {
  return `${CORPUS_PREFIX}${slug}.md`;
}

export function slugFromCorpusFileName(fileName: string): string | null {
  if (!fileName.startsWith(CORPUS_PREFIX) || !fileName.endsWith(".md")) return null;
  return fileName.slice(CORPUS_PREFIX.length, -".md".length);
}

const FENCE_RE = /^(```|~~~)/;
const IMPORT_LINE_RE = /^import\s.+$/;
const META_OPEN_RE = /^export const meta\s*=\s*\{/;
// A line that is only a JSX component tag (open, close, or self-closing),
// e.g. `<AssumedAudience>` / `</AssumedAudience>`. Inner content is kept.
const JSX_TAG_LINE_RE = /^\s*<\/?[A-Z][\w.]*(\s[^>]*)?\/?>?\s*$/;

function braceDelta(line: string): number {
  let delta = 0;
  for (const ch of line) {
    if (ch === "{") delta++;
    else if (ch === "}") delta--;
  }
  return delta;
}

/**
 * Converts an essay's MDX source to plain markdown for embedding/retrieval:
 * drops the meta export, imports, and JSX tag lines — but only outside fenced
 * code blocks, so code samples inside essays survive verbatim.
 */
export function mdxToPlainMarkdown(source: string): string {
  const out: string[] = [];
  let inFence = false;
  let metaDepth = 0;

  for (const line of source.split("\n")) {
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (metaDepth > 0) {
      metaDepth += braceDelta(line);
      continue;
    }
    if (META_OPEN_RE.test(line)) {
      metaDepth = braceDelta(line);
      continue;
    }
    if (IMPORT_LINE_RE.test(line)) continue;
    if (JSX_TAG_LINE_RE.test(line)) continue;
    out.push(line);
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** A corpus document is the essay's real title as an H1, then the plain body. */
export function buildCorpusDocument(title: string, mdxSource: string): string {
  return `# ${title}\n\n${mdxToPlainMarkdown(mdxSource)}\n`;
}
