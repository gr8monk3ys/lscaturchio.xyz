import { NextRequest } from 'next/server';
import { searchSimilarContent, isEmbeddingsAvailable } from '@/lib/embeddings';
import { createOllamaChatCompletion, isOllamaAvailable } from '@/lib/ollama';
import { logError, logInfo } from '@/lib/logger';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { validateCsrf } from '@/lib/csrf';
import { chatRequestSchema, parseBody } from '@/lib/validations';
import { extractBlogMeta } from '@/lib/blog-meta';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import fs from 'fs/promises';
import path from 'path';

// Determine which chat provider to use
const USE_OPENAI = !!process.env.OPENAI_API_KEY;
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';

// Lazy OpenAI initialization
let openaiClient: import('openai').default | null = null;

async function getOpenAI() {
  if (!openaiClient && USE_OPENAI) {
    const OpenAI = (await import('openai')).default;
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      timeout: 30000,
      maxRetries: 1,
    });
  }
  return openaiClient;
}

const SYSTEM_PROMPT = `You are me - Lorenzo Scaturchio, a software engineer and data scientist based in Los Angeles. Respond in first person as if you were me, drawing from the following context about my background, work, and expertise.

When introducing yourself, simply say "Hi, I'm Lorenzo" or something similarly natural. Avoid mentioning that you're an AI - just be me. Use a friendly, professional tone and speak from my perspective about my work, experience, and services.

If asked about specific experiences or project details not covered in the context, you can say something like "I'd be happy to discuss that in more detail over a call" or suggest reaching out directly.`;

const BLOG_DIR = path.join(process.cwd(), 'src', 'app', 'blog');

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function stripMdxImportsAndMeta(source: string): string {
  // Remove import lines
  let s = source.replace(/^import .+?;?\s*$/gm, '');

  // Remove `export const meta = { ... }` blocks (best-effort).
  s = s.replace(/export const meta\s*=\s*\{[\s\S]*?\}\s*;?/m, '');
  return s.trim();
}

function extractMdxHeadings(source: string): string[] {
  const headings: string[] = [];
  const lines = source.split('\n');
  for (const line of lines) {
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
    if (text) headings.push(text);
    if (headings.length >= 14) break;
  }
  return headings;
}

async function loadBlogContext(slug: string): Promise<{ title?: string; description?: string; headings: string[]; text: string } | null> {
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

  // Keep context tight to avoid ballooning prompts.
  const maxChars = 7000;
  const text = cleaned.length > maxChars ? `${cleaned.slice(0, maxChars)}\n\n[truncated]` : cleaned;

  return {
    title: meta.title,
    description: meta.description,
    headings,
    text,
  };
}

function buildFallbackAnswer(context: string): string {
  if (context.trim().length > 0) {
    const snippet = context.replace(/\s+/g, ' ').trim().slice(0, 500);
    return `I can’t reach my AI backend right now, but here’s relevant context from my writing: ${snippet}${snippet.length >= 500 ? '…' : ''}`;
  }
  return "I’m temporarily unable to run full AI responses right now. Please try again shortly or reach out through the contact page.";
}

const handlePost = async (req: NextRequest) => {
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();

    // Validate request body with Zod schema
    const parsed = parseBody(chatRequestSchema, body);
    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error);
    }

    const { query } = parsed.data;
    const contextSlug = parsed.data.contextSlug;

    // Get relevant context from our embeddings (gracefully degrades if unavailable)
    let context = '';
    let embeddingsAvailable = false;
    try {
      embeddingsAvailable = await isEmbeddingsAvailable();
    } catch (error) {
      logError('Embeddings availability check failed', error, { component: 'chat' });
      embeddingsAvailable = false;
    }

    if (embeddingsAvailable) {
      try {
        const similarContent = await searchSimilarContent(query);
        context = (similarContent as Array<{ content: string }>)
          .map((item) => item.content)
          .join('\n\n');
      } catch (error) {
        logError('Failed to search embeddings', error, { component: 'chat' });
        // Continue without context
      }
    }

    // Optional: include the full post context when the user came from a specific blog post.
    let postContext = '';
    if (contextSlug) {
      try {
        const post = await loadBlogContext(contextSlug);
        if (post) {
          const headingList = post.headings.length > 0 ? `\n\nSections:\n- ${post.headings.join('\n- ')}` : '';
          const titleLine = post.title ? `Title: ${post.title}` : `Slug: ${contextSlug}`;
          const descLine = post.description ? `\nDescription: ${post.description}` : '';
          postContext = `Blog post context:\n${titleLine}${descLine}${headingList}\n\nPost content:\n${post.text}`;
        }
      } catch (error) {
        logError('Failed to load blog context', error, { component: 'chat', contextSlug });
      }
    }

    // Prepare the full system prompt with context
    const systemPromptParts = [
      SYSTEM_PROMPT,
      postContext ? postContext : null,
      context ? `Additional context (semantic matches):\n${context}` : null,
    ].filter(Boolean) as string[];

    const systemPrompt = systemPromptParts.join("\n\n");

    let answer: string | null = null;
    let provider: 'openai' | 'ollama' | 'fallback' = 'fallback';

    // Try OpenAI first when configured
    if (USE_OPENAI) {
      try {
        const client = await getOpenAI();
        if (!client) {
          throw new Error('OpenAI client not initialized');
        }

        const completion = await client.chat.completions.create({
          model: OPENAI_CHAT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
          temperature: 0.4,
          max_tokens: 1000,
        });

        answer = completion.choices[0].message?.content || null;
        if (answer) {
          provider = 'openai';
        }
      } catch (error) {
        logError('OpenAI chat failed; falling back', error, { component: 'chat', model: OPENAI_CHAT_MODEL });
      }
    }

    // Fall back to Ollama if OpenAI is unavailable/fails
    if (!answer) {
      const ollamaAvailable = await isOllamaAvailable();
      if (ollamaAvailable) {
        try {
          logInfo('Using Ollama for chat', {
            component: 'chat',
            model: process.env.OLLAMA_CHAT_MODEL || 'llama3.2',
          });

          answer = await createOllamaChatCompletion(
            [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: query },
            ],
            { temperature: 0.4, maxTokens: 1000 }
          );
          provider = 'ollama';
        } catch (error) {
          logError('Ollama chat failed; using fallback response', error, { component: 'chat' });
        }
      }
    }

    // Never hard-fail the chat UX when providers are unavailable
    if (!answer) {
      answer = buildFallbackAnswer(context);
      provider = 'fallback';
    }

    return apiSuccess({
      answer,
      provider,
      degraded: provider === 'fallback',
    });
  } catch (error: unknown) {
    logError('Chat API request failed', error, { endpoint: '/api/chat' });
    return ApiErrors.internalError('Failed to process chat request');
  }
};

// Export with rate limiting (5 requests per minute)
export const POST = withRateLimit(handlePost, RATE_LIMITS.AI_HEAVY);
