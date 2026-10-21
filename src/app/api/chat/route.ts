import { groundingFor } from '@/lib/retrieval';
import { logError } from '@/lib/logger';
import { withWriteRoute } from '@/lib/api/write-route';
import { chatRequestSchema } from '@/lib/validations';
import { generateChatAnswer } from '@/lib/chat/providers';
import { buildSystemPromptWithContext, loadBlogContext } from '@/lib/chat/context';
import {
  SYSTEM_PROMPT,
  buildFallbackAnswer,
  sanitizeChatInput,
} from '@/lib/chat/security';

export const POST = withWriteRoute(
  {
    limit: 'CHAT',
    auth: {
      kind: 'public',
      reason: 'The site-wide chat box is open to every reader; abuse is bounded by the CHAT rate-limit policy.',
    },
    csrf: { kind: 'required' },
    body: { kind: 'json', schema: chatRequestSchema },
    guard: { kind: 'none', reason: 'Answers the reader who asked and sends nothing onward; the CHAT rate-limit policy bounds what a script can spend.' },
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

    // Retrieval and the open essay's context do not depend on each other, so
    // they load together rather than one after the other. Retrieval degrades to
    // keyword-only grounding without an embedding provider, and to none without
    // a database; it does not throw.
    const [retrieval, postContext] = await Promise.all([
      groundingFor(query),
      contextSlug
        ? loadBlogContext(contextSlug).catch((error: unknown) => {
            logError('Failed to load blog context', error, { component: 'chat', contextSlug });
            return null;
          })
        : Promise.resolve(null),
    ]);

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
