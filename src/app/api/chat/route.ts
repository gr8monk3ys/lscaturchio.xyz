import { NextRequest } from 'next/server';
import { hybridSearch } from '@/lib/embeddings';
import { logError } from '@/lib/logger';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { validateCsrf } from '@/lib/csrf';
import { chatRequestSchema, parseBody } from '@/lib/validations';
import { apiSuccess, ApiErrors } from '@/lib/api-response';
import { generateChatAnswer } from '@/lib/chat/providers';
import {
  buildSystemPromptWithContext,
  loadBlogContext,
  type SemanticRetrieval,
} from '@/lib/chat/context';
import {
  SYSTEM_PROMPT,
  buildFallbackAnswer,
  sanitizeChatInput,
} from '@/lib/chat/security';

async function loadSemanticRetrieval(query: string): Promise<SemanticRetrieval> {
  try {
    // hybridSearch degrades to lexical-only when no embedding provider is
    // configured, so there is no separate availability gate to check.
    const { results, confidence } = await hybridSearch(query);
    const context = results.map((r) => r.content).join('\n\n');

    const seen = new Set<string>();
    const closest: Array<{ title: string; url: string }> = [];
    for (const r of results) {
      const url = typeof r.metadata?.url === 'string' ? r.metadata.url : '';
      if (!url || seen.has(url)) continue;
      seen.add(url);
      const title = typeof r.metadata?.title === 'string' ? r.metadata.title : url;
      closest.push({ title, url });
      if (closest.length >= 3) break;
    }

    return { context, confidence, closest };
  } catch (error) {
    logError('Hybrid retrieval failed', error, { component: 'chat' });
    return { context: '', confidence: 'none', closest: [] };
  }
}

const handlePost = async (req: NextRequest) => {
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();
    const parsed = parseBody(chatRequestSchema, body);
    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error);
    }

    const query = sanitizeChatInput(parsed.data.query);
    const { contextSlug } = parsed.data;

    const retrieval = await loadSemanticRetrieval(query);

    let postContext = null;
    if (contextSlug) {
      try {
        postContext = await loadBlogContext(contextSlug);
      } catch (error) {
        logError('Failed to load blog context', error, { component: 'chat', contextSlug });
      }
    }

    const systemPrompt = buildSystemPromptWithContext(
      SYSTEM_PROMPT,
      postContext,
      retrieval,
    );

    const result = await generateChatAnswer(systemPrompt, query);

    if (result) {
      return apiSuccess({
        answer: result.answer,
        provider: result.provider,
        model: result.model,
        degraded: result.usedFallbackModel,
      });
    }

    return apiSuccess({
      answer: buildFallbackAnswer(retrieval.context, retrieval.closest, retrieval.confidence),
      provider: 'fallback' as const,
      model: null,
      degraded: true,
    });
  } catch (error: unknown) {
    logError('Chat API request failed', error, { endpoint: '/api/chat' });
    return ApiErrors.internalError('Failed to process chat request');
  }
};

export const POST = withRateLimit(handlePost, RATE_LIMITS.CHAT);
