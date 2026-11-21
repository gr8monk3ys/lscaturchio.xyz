/**
 * @vitest-environment node
 *
 * The chat end to end, as POST /api/chat runs it minus the HTTP layer (rate
 * limit, CSRF): sanitize the question, retrieve with `groundingFor`, build the
 * system prompt, answer with the provider ladder. A question no model answers
 * fails rather than being scored on the no-model fallback. Change the prompt,
 * the grounding rules or retrieval, run this, and compare with the last run.
 *
 * Needs DATABASE_URL and a chat model: OPENAI_API_KEY or OPENROUTER_API_KEY
 * (billed per question; 15 short questions per run), or a running Ollama
 * (free). Skips with a message when either is missing.
 */

import { evalite, type Evalite } from 'evalite';

import { generateChatAnswer } from '@/lib/chat/providers';
import { buildSystemPromptWithContext } from '@/lib/chat/context';
import { SYSTEM_PROMPT, sanitizeChatInput } from '@/lib/chat/security';
import { groundingFor } from '@/lib/retrieval';

import { IN_SCOPE_CASES, OUT_OF_SCOPE_CASES, type InScopeCase, type OutOfScopeCase } from './cases';
import { announceSkip, missingChatModel, missingDatabase } from './env';
import {
  answersInsteadOfDeclining,
  avoidsForbidden,
  declines,
  hitAt3,
  requiredFacts,
  type ChatOutput,
} from './scorers';

async function askChat(question: string): Promise<ChatOutput> {
  const query = sanitizeChatInput(question);
  const retrieval = await groundingFor(query);
  const systemPrompt = buildSystemPromptWithContext(SYSTEM_PROMPT, null, retrieval);
  const result = await generateChatAnswer(systemPrompt, query);

  // The route would now send the no-model fallback, which quotes the retrieved
  // passage. Scoring that would credit the essay for the model's facts and its
  // "hasn't written about that" as a decline, so the case fails instead.
  if (!result) {
    throw new Error(
      'No chat model answered: every provider in the ladder failed. Check the key, its quota, or Ollama.',
    );
  }

  return {
    answer: result.answer,
    provider: result.provider,
    model: result.model,
    confidence: retrieval.confidence,
    slugs: retrieval.closest.map((c) => c.url.split('/').pop() ?? ''),
  };
}

const IN_SCOPE_NAME = 'Chat: answers from the essays';
const OUT_OF_SCOPE_NAME = 'Chat: declines what the essays do not cover';

const inScope: Evalite.RunnerOpts<string, ChatOutput, InScopeCase> = {
  data: IN_SCOPE_CASES.map((c) => ({ input: c.question, expected: c })),
  task: askChat,
  scorers: [requiredFacts, answersInsteadOfDeclining, hitAt3],
  columns: ({ output }) => [
    { label: 'Model', value: `${output.provider}/${output.model}` },
    { label: 'Retrieved', value: output.slugs.join(', ') },
  ],
};

const outOfScope: Evalite.RunnerOpts<string, ChatOutput, OutOfScopeCase> = {
  data: OUT_OF_SCOPE_CASES.map((c) => ({ input: c.question, expected: c })),
  task: askChat,
  scorers: [declines, avoidsForbidden],
  columns: ({ output, expected }) => [
    { label: 'Model', value: `${output.provider}/${output.model}` },
    { label: 'Why decline', value: expected?.why ?? '' },
  ],
};

const missing = [missingDatabase(), await missingChatModel()].filter(
  (reason): reason is string => reason !== null,
);

if (missing.length > 0) {
  announceSkip('Chat', missing);
  evalite.skip(IN_SCOPE_NAME, inScope);
  evalite.skip(OUT_OF_SCOPE_NAME, outOfScope);
} else {
  evalite(IN_SCOPE_NAME, inScope);
  evalite(OUT_OF_SCOPE_NAME, outOfScope);
}
