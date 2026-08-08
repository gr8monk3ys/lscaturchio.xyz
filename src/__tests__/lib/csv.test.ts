import { describe, it, expect } from 'vitest';
import { parseCsv } from '@/lib/csv';

describe('parseCsv', () => {
  it('maps rows onto header keys', () => {
    const rows = parseCsv('a,b,c\n1,2,3');
    expect(rows).toEqual([{ a: '1', b: '2', c: '3' }]);
  });

  it('keeps commas inside quoted fields', () => {
    const rows = parseCsv('title,year\n"Comma, The Movie",2024');
    expect(rows[0].title).toBe('Comma, The Movie');
  });

  // The whole reason this parser exists: the Goodreads and Letterboxd exports
  // quote free-text fields that contain literal newlines, and splitting the
  // file on \n before parsing shreds those records and shifts every column.
  it('keeps newlines inside quoted fields', () => {
    const rows = parseCsv('name,review\nIkiru,"first line\nsecond line"\nRan,short');

    expect(rows).toHaveLength(2);
    expect(rows[0].review).toBe('first line\nsecond line');
    expect(rows[1]).toEqual({ name: 'Ran', review: 'short' });
  });

  it('unescapes doubled quotes', () => {
    const rows = parseCsv('name,note\nMishima,"a ""text to be perfected"" idea"');
    expect(rows[0].note).toBe('a "text to be perfected" idea');
  });

  it('fills missing trailing columns with empty strings', () => {
    const rows = parseCsv('a,b,c\n1,2');
    expect(rows[0]).toEqual({ a: '1', b: '2', c: '' });
  });

  it('trims surrounding whitespace on cells', () => {
    const rows = parseCsv('a,b\n  1  ,  2  ');
    expect(rows[0]).toEqual({ a: '1', b: '2' });
  });

  it('handles CRLF line endings', () => {
    const rows = parseCsv('a,b\r\n1,2\r\n3,4');
    expect(rows).toEqual([
      { a: '1', b: '2' },
      { a: '3', b: '4' },
    ]);
  });

  it('reads a final row with no trailing newline', () => {
    const rows = parseCsv('a\n1\n2');
    expect(rows).toEqual([{ a: '1' }, { a: '2' }]);
  });

  it('drops rows that are entirely empty', () => {
    const rows = parseCsv('a,b\n1,2\n,\n3,4');
    expect(rows).toEqual([
      { a: '1', b: '2' },
      { a: '3', b: '4' },
    ]);
  });

  it('returns an empty list for a header-only or empty document', () => {
    expect(parseCsv('a,b,c')).toEqual([]);
    expect(parseCsv('')).toEqual([]);
    expect(parseCsv('   \n  ')).toEqual([]);
  });
});
