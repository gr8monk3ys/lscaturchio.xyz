import { listEssaySources } from "../src/lib/essay-sources";

type PostIndexEntry = {
  slug: string;
  title: string;
  tags: string[];
  keywords: string[];
};

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "into",
  "your",
  "you",
  "are",
  "was",
  "were",
  "not",
  "but",
  "why",
  "how",
  "what",
  "when",
  "where",
  "who",
  "is",
  "in",
  "on",
  "of",
  "to",
  "a",
  "an",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\\s-]/g, " ")
    .split(/\\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w))
    .slice(0, 30);
}

function score(a: PostIndexEntry, b: PostIndexEntry): { score: number; sharedTags: string[]; sharedKeywords: string[] } {
  const tagsB = new Set(b.tags);
  const sharedTags = a.tags.filter((t) => tagsB.has(t));

  const kwB = new Set(b.keywords);
  const sharedKeywords = a.keywords.filter((k) => kwB.has(k));

  // Tags are far more intentional than title words.
  const s = sharedTags.length * 5 + sharedKeywords.length;
  return { score: s, sharedTags, sharedKeywords };
}

async function buildIndex(): Promise<PostIndexEntry[]> {
  const essays = await listEssaySources();

  return essays.map(({ slug, meta }) => ({
    slug,
    title: meta.title!,
    tags: (meta.tags ?? []).map((t) => t.toLowerCase()),
    keywords: tokenize(meta.title!),
  }));
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const asJson = args.has("--json");
  const limit = Number.parseInt(process.env.LINK_SUGGEST_LIMIT || "6", 10) || 6;

  const index = await buildIndex();

  const suggestions = index.map((p) => {
    const scored = index
      .filter((other) => other.slug !== p.slug)
      .map((other) => ({ other, ...score(p, other) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      slug: p.slug,
      title: p.title,
      suggestions: scored.map((x) => ({
        slug: x.other.slug,
        title: x.other.title,
        score: x.score,
        sharedTags: x.sharedTags,
        sharedKeywords: x.sharedKeywords,
        url: `/blog/${x.other.slug}`,
      })),
    };
  });

  if (asJson) {
    process.stdout.write(JSON.stringify({ count: suggestions.length, suggestions }, null, 2));
    return;
  }

  // Human-friendly markdown output
  for (const s of suggestions) {
    process.stdout.write(`\\n## ${s.title} (/blog/${s.slug})\\n`);
    if (s.suggestions.length === 0) {
      process.stdout.write(`- (no suggestions)\\n`);
      continue;
    }
    for (const sug of s.suggestions) {
      const why = [
        sug.sharedTags.length > 0 ? `tags: ${sug.sharedTags.join(", ")}` : null,
        sug.sharedKeywords.length > 0 ? `keywords: ${sug.sharedKeywords.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join(" | ");
      process.stdout.write(`- [${sug.title}](${sug.url}) (score ${sug.score}${why ? `, ${why}` : ""})\\n`);
    }
  }

  process.stdout.write(`\\n\\nGenerated suggestions for ${suggestions.length} posts.\\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
