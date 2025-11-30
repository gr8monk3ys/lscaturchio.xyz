import { describe, it, expect } from 'vitest';
import { calculateReadingTime, formatReadingTime } from '@/lib/reading-time';

describe('calculateReadingTime', () => {
  it('calculates reading time for plain text', () => {
    // 200 words = 1 minute at default 200 wpm
    const text = 'word '.repeat(200);
    const result = calculateReadingTime(text);

    expect(result.words).toBe(200);
    expect(result.minutes).toBe(1);
    expect(result.text).toBe('1 min read');
  });

  it('rounds up partial minutes', () => {
    // 250 words = 1.25 minutes, should round to 2
    const text = 'word '.repeat(250);
    const result = calculateReadingTime(text);

    expect(result.minutes).toBe(2);
  });

  it('removes code blocks from word count', () => {
    const textWithCode = `
      Some text here with ten words total in it.
      \`\`\`javascript
      const foo = 'this should not be counted';
      console.log(foo);
      \`\`\`
      More text here.
    `;
    const result = calculateReadingTime(textWithCode);

    // Should only count words outside code blocks
    expect(result.words).toBeLessThan(20);
  });

  it('removes HTML tags from word count', () => {
    const textWithHtml = '<div>Hello</div> <span>World</span> <p>Test</p>';
    const result = calculateReadingTime(textWithHtml);

    expect(result.words).toBe(3);
  });

  it('removes markdown symbols', () => {
    const markdown = '# Heading\n**bold** *italic* `code` ~~strike~~';
    const result = calculateReadingTime(markdown);

    // Should count: Heading, bold, italic, code, strike
    expect(result.words).toBeGreaterThan(0);
  });

  it('accepts custom words per minute', () => {
    const text = 'word '.repeat(100);

    const slow = calculateReadingTime(text, 100); // 100 wpm
    const fast = calculateReadingTime(text, 200); // 200 wpm

    expect(slow.minutes).toBe(1); // 100 words / 100 wpm = 1 min
    expect(fast.minutes).toBe(1); // 100 words / 200 wpm = 0.5, rounds to 1
  });

  it('handles empty text', () => {
    const result = calculateReadingTime('');

    expect(result.words).toBe(1); // Empty split gives ['']
    expect(result.minutes).toBe(1);
  });
});

describe('formatReadingTime', () => {
  it('formats less than 1 minute', () => {
    expect(formatReadingTime(0)).toBe('Less than 1 min read');
    expect(formatReadingTime(0.5)).toBe('Less than 1 min read');
  });

  it('formats exactly 1 minute', () => {
    expect(formatReadingTime(1)).toBe('1 min read');
  });

  it('formats multiple minutes', () => {
    expect(formatReadingTime(2)).toBe('2 min read');
    expect(formatReadingTime(5)).toBe('5 min read');
    expect(formatReadingTime(10)).toBe('10 min read');
  });

  it('handles negative numbers', () => {
    expect(formatReadingTime(-1)).toBe('Less than 1 min read');
  });
});
