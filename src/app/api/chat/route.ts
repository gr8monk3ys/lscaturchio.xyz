import { NextRequest, NextResponse } from 'next/server';
import { searchSimilarContent, isEmbeddingsAvailable } from '@/lib/embeddings';
import { createOllamaChatCompletion, isOllamaAvailable } from '@/lib/ollama';
import { logError, logInfo } from '@/lib/logger';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { validateCsrf } from '@/lib/csrf';
import { chatRequestSchema, parseBody } from '@/lib/validations';

// Determine which chat provider to use
const USE_OPENAI = !!process.env.OPENAI_API_KEY;

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

const handlePost = async (req: NextRequest) => {
  // CSRF protection
  const csrfError = validateCsrf(req);
  if (csrfError) return csrfError;

  try {
    const body = await req.json();

    // Validate request body with Zod schema
    const parsed = parseBody(chatRequestSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { query } = parsed.data;

    // Get relevant context from our embeddings (gracefully degrades if unavailable)
    let context = '';
    const embeddingsAvailable = await isEmbeddingsAvailable();
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

    // Prepare the full system prompt with context
    const systemPrompt = context
      ? `${SYSTEM_PROMPT}\n\nContext:\n${context}`
      : SYSTEM_PROMPT;

    let answer: string;

    if (USE_OPENAI) {
      // Use OpenAI
      const client = await getOpenAI();
      if (!client) {
        throw new Error('OpenAI client not initialized');
      }

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-2024-08-06',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.4,
        max_tokens: 1000,
      });

      answer = completion.choices[0].message?.content || "Sorry, I couldn't generate a response.";
    } else {
      // Use Ollama
      const ollamaAvailable = await isOllamaAvailable();
      if (!ollamaAvailable) {
        return NextResponse.json(
          {
            error: 'Chat service unavailable',
            message: 'No AI provider configured. Please set OPENAI_API_KEY or start Ollama server.',
          },
          { status: 503 }
        );
      }

      logInfo('Using Ollama for chat', { component: 'chat', model: process.env.OLLAMA_CHAT_MODEL || 'llama3.2' });

      answer = await createOllamaChatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        { temperature: 0.4, maxTokens: 1000 }
      );
    }

    return NextResponse.json({
      answer,
      provider: USE_OPENAI ? 'openai' : 'ollama',
    });
  } catch (error: unknown) {
    logError('Chat API request failed', error, { endpoint: '/api/chat' });
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
};

// Export with rate limiting (5 requests per minute)
export const POST = withRateLimit(handlePost, RATE_LIMITS.AI_HEAVY);
