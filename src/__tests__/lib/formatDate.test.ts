import { describe, it, expect } from 'vitest';
import { formatDate } from '@/lib/formatDate';

describe('formatDate', () => {
  it('formats a date correctly', () => {
    const date = new Date('2024-01-15T10:30:00');
    const result = formatDate(date);

    // Check that it contains expected parts (timezone-agnostic)
    expect(result).toContain('January');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('handles midnight correctly', () => {
    const date = new Date('2024-06-01T00:00:00');
    const result = formatDate(date);

    expect(result).toContain('June');
    expect(result).toContain('1');
    expect(result).toContain('2024');
  });

  it('handles different months', () => {
    const dates = [
      { input: new Date('2024-03-15'), expected: 'March' },
      { input: new Date('2024-07-20'), expected: 'July' },
      { input: new Date('2024-12-25'), expected: 'December' },
    ];

    dates.forEach(({ input, expected }) => {
      expect(formatDate(input)).toContain(expected);
    });
  });

  it('uses 12-hour format with AM/PM', () => {
    const morningDate = new Date('2024-01-15T09:30:00');
    const eveningDate = new Date('2024-01-15T21:30:00');

    const morningResult = formatDate(morningDate);
    const eveningResult = formatDate(eveningDate);

    // Should contain AM or PM
    expect(morningResult).toMatch(/AM|PM/);
    expect(eveningResult).toMatch(/AM|PM/);
  });
});
