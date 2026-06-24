/**
 * Shared OpenAI-style error classification, used by both the embeddings layer
 * and the chat providers so the two cannot drift apart (they previously kept
 * near-identical private copies).
 */

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    // JSON.stringify(undefined) / of a symbol is `undefined`, not a string —
    // fall back to String() so this is always safe to call .toLowerCase() on.
    return JSON.stringify(error) ?? String(error);
  } catch {
    return String(error);
  }
}

export function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : undefined;
}

/**
 * True for errors that mean "the API key is missing, wrong, or disabled" — i.e.
 * a configuration problem we should degrade gracefully on rather than retry.
 */
export function isOpenAIAuthOrConfigError(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status === 401 || status === 403) return true;

  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('incorrect api key') ||
    message.includes('invalid api key') ||
    message.includes('api key not found') ||
    message.includes('authentication') ||
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('account associated with this api key has been deactivated')
  );
}
