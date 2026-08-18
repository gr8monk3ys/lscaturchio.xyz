/**
 * Regenerates public/my-data/blog-*.md from src/app/blog/<slug>/content.mdx.
 *
 * The corpus behind /chat previously rotted silently: the .md copies were
 * dumped once by hand, so revised essays kept being retrieved in their old
 * wording (and several titles were truncated at apostrophes — "# Abolition
 * Isn"). This script makes the corpus a derived artifact:
 *
 *   npm run sync-retrieval-corpus            # rewrite stale files, delete orphans
 *   npm run sync-retrieval-corpus -- --check # exit 1 on drift (runs in CI)
 *
 * After a real sync, rerun `npm run generate-embeddings` so retrieval matches
 * (it is content-hash incremental, so unchanged essays are skipped).
 */
import fs from "fs";
import path from "path";
import { extractBlogMeta } from "../src/lib/blog-meta";
import {
  buildCorpusDocument,
  corpusFileName,
  slugFromCorpusFileName,
} from "../src/lib/retrieval-corpus";

const BLOG_DIR = path.join(process.cwd(), "src", "app", "blog");
const DATA_DIR = path.join(process.cwd(), "public", "my-data");

function main() {
  const check = process.argv.includes("--check");

  const slugs = fs
    .readdirSync(BLOG_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((slug) => fs.existsSync(path.join(BLOG_DIR, slug, "content.mdx")))
    .sort();

  const stale: string[] = [];
  let unchanged = 0;

  for (const slug of slugs) {
    const mdx = fs.readFileSync(path.join(BLOG_DIR, slug, "content.mdx"), "utf-8");
    const meta = extractBlogMeta(mdx);
    if (!meta.title) {
      // Usually ASI: `export const meta = {...}` without a trailing `;`,
      // followed by JSX, parses as one continued expression and the meta
      // object is lost. Add the semicolon in the post.
      console.error(`✗ ${slug}: could not parse meta.title from content.mdx`);
      process.exit(1);
    }
    const expected = buildCorpusDocument(meta.title, mdx);
    const target = path.join(DATA_DIR, corpusFileName(slug));

    const current = fs.existsSync(target) ? fs.readFileSync(target, "utf-8") : null;
    if (current === expected) {
      unchanged++;
      continue;
    }
    stale.push(corpusFileName(slug));
    if (!check) fs.writeFileSync(target, expected);
  }

  // blog-*.md files whose essay no longer exists.
  const slugSet = new Set(slugs);
  const orphans = fs
    .readdirSync(DATA_DIR)
    .filter((f) => {
      const slug = slugFromCorpusFileName(f);
      return slug !== null && !slugSet.has(slug);
    })
    .sort();
  if (!check) {
    for (const f of orphans) fs.unlinkSync(path.join(DATA_DIR, f));
  }

  const drift = stale.length + orphans.length;
  if (check) {
    if (drift > 0) {
      console.error(
        `Retrieval corpus is out of sync with the essays ` +
          `(${stale.length} stale/missing, ${orphans.length} orphaned):`
      );
      for (const f of stale) console.error(`  stale:  ${f}`);
      for (const f of orphans) console.error(`  orphan: ${f}`);
      console.error(`\nRun: npm run sync-retrieval-corpus`);
      process.exit(1);
    }
    console.log(`Retrieval corpus in sync (${unchanged} files).`);
    return;
  }

  console.log(
    `Synced retrieval corpus: ${stale.length} written, ${orphans.length} deleted, ` +
      `${unchanged} unchanged.`
  );
  if (drift > 0) {
    console.log(`Now rerun: npm run generate-embeddings`);
  }
}

main();
