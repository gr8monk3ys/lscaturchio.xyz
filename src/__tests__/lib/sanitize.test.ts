import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidSlug,
  validatePagination,
  escapeHtml,
  sanitizeForHtmlEmail,
  sanitizeEmailSubject,
} from '@/lib/sanitize';

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name@example.com')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
    expect(isValidEmail('user@subdomain.example.com')).toBe(true);
    expect(isValidEmail('user@example.co.uk')).toBe(true);
    expect(isValidEmail('a@b.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('user@.com')).toBe(false);
    expect(isValidEmail('user@example')).toBe(false);
    expect(isValidEmail('user@example.c')).toBe(false); // Single char TLD
    expect(isValidEmail('user..name@example.com')).toBe(false); // Consecutive dots
    expect(isValidEmail('.user@example.com')).toBe(false); // Starts with dot
    expect(isValidEmail('user.@example.com')).toBe(false); // Ends with dot before @
  });

  it('rejects non-string inputs', () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
    expect(isValidEmail(123 as unknown as string)).toBe(false);
  });

  it('rejects overly long emails', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    expect(isValidEmail(longEmail)).toBe(false);
  });
});

describe('isValidSlug', () => {
  it('accepts valid slugs', () => {
    expect(isValidSlug('hello-world')).toBe(true);
    expect(isValidSlug('post-123')).toBe(true);
    expect(isValidSlug('a')).toBe(true);
    expect(isValidSlug('my-first-blog-post')).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('Hello-World')).toBe(false); // Uppercase
    expect(isValidSlug('hello_world')).toBe(false); // Underscore
    expect(isValidSlug('hello world')).toBe(false); // Space
    expect(isValidSlug('hello/world')).toBe(false); // Slash
    expect(isValidSlug('../path')).toBe(false); // Path traversal
  });

  it('rejects overly long slugs', () => {
    const longSlug = 'a'.repeat(201);
    expect(isValidSlug(longSlug)).toBe(false);
  });

  it('rejects non-string inputs', () => {
    expect(isValidSlug(null as unknown as string)).toBe(false);
    expect(isValidSlug(undefined as unknown as string)).toBe(false);
  });
});

describe('validatePagination', () => {
  it('returns defaults for null inputs', () => {
    expect(validatePagination(null, null)).toEqual({ limit: 10, offset: 0 });
  });

  it('parses string inputs', () => {
    expect(validatePagination('20', '50')).toEqual({ limit: 20, offset: 50 });
  });

  it('clamps values to valid ranges', () => {
    expect(validatePagination(-5, -10)).toEqual({ limit: 1, offset: 0 });
    expect(validatePagination(500, 50000)).toEqual({ limit: 100, offset: 10000 });
  });

  it('handles NaN gracefully', () => {
    expect(validatePagination('invalid', 'bad')).toEqual({ limit: 10, offset: 0 });
  });

  it('respects custom max values', () => {
    expect(validatePagination(50, 500, 20, 100)).toEqual({ limit: 20, offset: 100 });
  });
});

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
    expect(escapeHtml("It's a test")).toBe("It&#039;s a test");
    expect(escapeHtml('A & B')).toBe('A &amp; B');
  });

  it('handles non-string input', () => {
    expect(escapeHtml(null as unknown as string)).toBe('');
    expect(escapeHtml(123 as unknown as string)).toBe('');
  });
});

describe('sanitizeForHtmlEmail', () => {
  it('escapes HTML and converts newlines', () => {
    expect(sanitizeForHtmlEmail('Hello\nWorld')).toBe('Hello<br>World');
    expect(sanitizeForHtmlEmail('<b>Bold</b>\nLine')).toBe('&lt;b&gt;Bold&lt;/b&gt;<br>Line');
  });

  it('trims whitespace', () => {
    expect(sanitizeForHtmlEmail('  hello  ')).toBe('hello');
  });
});

describe('sanitizeEmailSubject', () => {
  it('removes newlines to prevent header injection', () => {
    expect(sanitizeEmailSubject('Normal Subject')).toBe('Normal Subject');
    expect(sanitizeEmailSubject('Injected\r\nBcc: attacker@evil.com')).toBe(
      'Injected  Bcc: attacker@evil.com'
    );
  });

  it('limits length', () => {
    const longSubject = 'a'.repeat(300);
    expect(sanitizeEmailSubject(longSubject).length).toBe(200);
  });

  it('handles non-string input', () => {
    expect(sanitizeEmailSubject(null as unknown as string)).toBe('');
  });
});
