import { describe, it, expect } from 'vitest';
import {
  getErrorMessage,
  getErrorStatus,
  isOpenAIAuthOrConfigError,
} from '@/lib/openai-errors';

describe('getErrorMessage', () => {
  it('reads Error.message, plain strings, and falls back to JSON', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
    expect(getErrorMessage('plain')).toBe('plain');
    expect(getErrorMessage({ a: 1 })).toBe('{"a":1}');
  });
});

describe('getErrorStatus', () => {
  it('returns a numeric status or undefined', () => {
    expect(getErrorStatus({ status: 401 })).toBe(401);
    expect(getErrorStatus({ status: 'nope' })).toBeUndefined();
    expect(getErrorStatus(null)).toBeUndefined();
  });
});

describe('isOpenAIAuthOrConfigError', () => {
  it('flags 401/403 status codes but not other statuses', () => {
    expect(isOpenAIAuthOrConfigError({ status: 401 })).toBe(true);
    expect(isOpenAIAuthOrConfigError({ status: 403 })).toBe(true);
    expect(isOpenAIAuthOrConfigError({ status: 500 })).toBe(false);
  });

  it('flags auth/config messages case-insensitively, including a deactivated key', () => {
    expect(isOpenAIAuthOrConfigError(new Error('Incorrect API key provided'))).toBe(true);
    expect(isOpenAIAuthOrConfigError(new Error('Unauthorized'))).toBe(true);
    expect(
      isOpenAIAuthOrConfigError(
        new Error('Your account associated with this API key has been deactivated'),
      ),
    ).toBe(true);
  });

  it('does not flag unrelated errors', () => {
    expect(isOpenAIAuthOrConfigError(new Error('rate limit exceeded'))).toBe(false);
    expect(isOpenAIAuthOrConfigError(undefined)).toBe(false);
  });
});
