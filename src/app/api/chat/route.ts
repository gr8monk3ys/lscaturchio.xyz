import { NextRequest } from 'next/server';
import { isEmbeddingsAvailable, searchSimilarContent } from '@/lib/embeddings';
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
} from '@/lib/chat/context';
import {
  SYSTEM_PROMPT,
  buildFallbackAnswer,
  sanitizeChatInput,
} from '@/lib/chat/security';

async function loadSemanticContext(query: string): Promise<string> {
  let available = false;
  try {
    available = await isEmbeddingsAvailable();
  } catch (error) {
    logError('Embeddings availability check failed', error, { component: 'chat' });
    return '';
  }
  if (!available) return '';

  try {
    const matches = await searchSimilarContent(query);
    return (matches as Array<{ content: string }>).map((item) => item.content).join('\n\n');
  } catch (error) {
    logError('Failed to search embeddings', error, { component: 'chat' });
    return '';
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

    const semanticContext = await loadSemanticContext(query);

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
      semanticContext,
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
      answer: buildFallbackAnswer(semanticContext),
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
