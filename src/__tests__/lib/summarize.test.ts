import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the OpenAI client so we control exactly what the model "returns".
// `vi.hoisted` makes `create` available inside the hoisted vi.mock factory.
const { create } = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = { completions: { create } };
  },
}));
vi.mock('@/lib/logger', () => ({ logError: vi.fn() }));

import { generateKeyTakeaways } from '@/lib/summarize';

function modelReturns(content: string) {
  create.mockResolvedValue({ choices: [{ message: { content } }] });
}

describe('generateKeyTakeaways — model-output robustness', () => {
  beforeEach(() => {
    create.mockReset();
  });

  it('returns the takeaways array when the model returns a well-formed list', async () => {
    modelReturns('{"takeaways":["First point","Second point"]}');
    expect(await generateKeyTakeaways('content', 2)).toEqual([
      'First point',
      'Second point',
    ]);
  });

  it('returns [] when the takeaways field is valid JSON but not an array', async () => {
    // The model is asked for a JSON array but can return a bare string; the old
    // `result.takeaways || []` leaked that string and broke the string[] contract.
    modelReturns('{"takeaways":"not an array"}');
    expect(await generateKeyTakeaways('content', 3)).toEqual([]);
  });

  it('drops non-string entries from a mixed array', async () => {
    modelReturns('{"takeaways":["good", 42, null, "also good"]}');
    expect(await generateKeyTakeaways('content', 3)).toEqual(['good', 'also good']);
  });

  it('returns [] when the takeaways key is absent', async () => {
    modelReturns('{"summary":"nope"}');
    expect(await generateKeyTakeaways('content', 3)).toEqual([]);
  });
});
