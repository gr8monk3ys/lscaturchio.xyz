import { hybridSearch } from '@/lib/embeddings';
import { logError } from '@/lib/logger';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { withWriteRoute } from '@/lib/api/write-route';
import { chatRequestSchema } from '@/lib/validations';
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

export const POST = withWriteRoute(
  {
    limit: RATE_LIMITS.CHAT,
    auth: {
      kind: 'public',
      reason: 'The site-wide chat box is open to every reader; abuse is bounded by RATE_LIMITS.CHAT.',
    },
    csrf: { kind: 'required' },
    body: { kind: 'json', schema: chatRequestSchema },
    envelope: { kind: 'standard' },
    errors: {
      log: 'Chat API request failed',
      component: 'chat',
      action: 'POST',
      message: 'Failed to process chat request',
    },
  },
  async ({ data }) => {
    const query = sanitizeChatInput(data.query);
    const { contextSlug } = data;

    const retrieval = await loadSemanticRetrieval(query);

    let postContext = null;
    if (contextSlug) {
      try {
        postContext = await loadBlogContext(contextSlug);
      } catch (error) {
        logError('Failed to load blog context', error, { component: 'chat', contextSlug });
      }
    }

    const systemPrompt = buildSystemPromptWithContext(SYSTEM_PROMPT, postContext, retrieval);

    const result = await generateChatAnswer(systemPrompt, query);

    if (result) {
      return {
        answer: result.answer,
        provider: result.provider,
        model: result.model,
        degraded: result.usedFallbackModel,
      };
    }

    return {
      answer: buildFallbackAnswer(retrieval.context, retrieval.closest, retrieval.confidence),
      provider: 'fallback' as const,
      model: null,
      degraded: true,
    };
  }
);
