import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  sanitizeForHtmlEmail,
  sanitizeEmailSubject,
} from '@/lib/sanitize';

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
