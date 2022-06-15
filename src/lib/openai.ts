import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors with missing env vars
let openai: OpenAI | null = null;

/**
 * Get a singleton OpenAI client instance.
 * Lazily initialized to avoid build-time errors when env vars are not set.
 * @throws Error if OPENAI_API_KEY is not configured
 */
export function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not configured');
    }
    openai = new OpenAI({
      apiKey,
      timeout: 30000, // 30 second timeout
      maxRetries: 1,
    });
  }
  return openai;
}
