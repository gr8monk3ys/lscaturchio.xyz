import { NextResponse } from 'next/server';
import { ai, DEFAULT_MODELS } from '@/lib/ai';
import { withRateLimit, RATE_LIMITS } from '@/lib/with-rate-limit';

/**
 * GET /api/ai/providers
 * Returns list of available AI providers and their status
 */
export const GET = withRateLimit(async () => {
  const providers = ['openai', 'anthropic', 'google'] as const;

  const providerStatus = providers.map((provider) => ({
    provider,
    available: ai.isProviderAvailable(provider),
    defaultChatModel: DEFAULT_MODELS[provider].chat,
    defaultEmbeddingModel: DEFAULT_MODELS[provider].embedding || null,
    supportsEmbeddings: provider !== 'anthropic',
  }));

  return NextResponse.json({
    defaultProvider: ai.getDefaultProvider(),
    availableProviders: ai.getAvailableProviders(),
    providers: providerStatus,
  });
}, RATE_LIMITS.PUBLIC);
