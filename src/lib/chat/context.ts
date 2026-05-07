import fs from 'fs/promises';
import path from 'path';
import { extractBlogMeta } from '@/lib/blog-meta';

const BLOG_DIR = path.join(process.cwd(), 'src', 'app', 'blog');
const MAX_CONTEXT_CHARS = 7000;
const MAX_HEADINGS = 14;

export type BlogContext = {
  title?: string;
  description?: string;
  headings: string[];
  text: string;
};

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function stripMdxImportsAndMeta(source: string): string {
  let s = source.replace(/^import .+?;?\s*$/gm, '');
  s = s.replace(/export const meta\s*=\s*\{[\s\S]*?\}\s*;?/m, '');
  return s.trim();
}

function extractMdxHeadings(source: string): string[] {
  const headings: string[] = [];
  for (const line of source.split('\n')) {
    const m = line.match(/^#{2,3}\s+(.+?)\s*$/);
    if (!m) continue;
    const text = m[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
    if (text) headings.push(text);
    if (headings.length >= MAX_HEADINGS) break;
  }
  return headings;
}

export async function loadBlogContext(slug: string): Promise<BlogContext | null> {
  const candidates = [
    path.join(BLOG_DIR, slug, 'content.mdx'),
    path.join(BLOG_DIR, `${slug}.mdx`),
  ];

  let mdx: string | null = null;
  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      mdx = await fs.readFile(candidate, 'utf-8');
      break;
    }
  }

  if (!mdx) return null;

  const meta = extractBlogMeta(mdx);
  const cleaned = stripMdxImportsAndMeta(mdx);
  const headings = extractMdxHeadings(cleaned);
  const text =
    cleaned.length > MAX_CONTEXT_CHARS
      ? `${cleaned.slice(0, MAX_CONTEXT_CHARS)}\n\n[truncated]`
      : cleaned;

  return {
    title: meta.title,
    description: meta.description,
    headings,
    text,
  };
}

export function buildSystemPromptWithContext(
  systemPrompt: string,
  postContext: BlogContext | null,
  semanticContext: string,
): string {
  const postBlock = postContext
    ? formatBlogContextBlock(postContext)
    : null;

  const semanticBlock = semanticContext
    ? `Additional context (semantic matches):\n${semanticContext}`
    : null;

  return [systemPrompt, postBlock, semanticBlock].filter(Boolean).join('\n\n');
}

function formatBlogContextBlock(post: BlogContext): string {
  const headingList =
    post.headings.length > 0 ? `\n\nSections:\n- ${post.headings.join('\n- ')}` : '';
  const titleLine = post.title ? `Title: ${post.title}` : '';
  const descLine = post.description ? `\nDescription: ${post.description}` : '';
  return `Blog post context:\n${titleLine}${descLine}${headingList}\n\nPost content:\n${post.text}`;
}
