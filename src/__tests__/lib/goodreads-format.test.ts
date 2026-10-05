import { describe, it, expect } from 'vitest';
import { exportIsbn, libraryTable, parseGoodreadsRss } from '@/lib/goodreads-format';
import { roundTripCommitted } from './committed-csv';

describe('libraryTable', () => {
  // The refresh script reads the export through this table and writes it back;
  // for the same input it must write exactly what it read.
  it('round-trips the committed library export byte for byte', () => {
    const { input, output, count } = roundTripCommitted(
      'goodreads/goodreads_library_export.csv',
      libraryTable,
    );

    expect(count).toBeGreaterThan(0);
    expect(output).toBe(input);
  });

  it('refuses, in strict mode, an export whose columns have moved', () => {
    const shuffled = libraryTable.columns.slice().reverse().join(',') + '\n';
    expect(() => libraryTable.parse(shuffled, { strict: true })).toThrow(/header mismatch/);
  });

  it('keeps the export’s ="…" ISBN wrapping intact through a round trip', () => {
    const [row] = libraryTable.parse(
      `${libraryTable.columns.join(',')}\n1,T,A,,,"=""0141439512""","=""""",0,,,,,,,,,,,read,,,,0,0`,
    );
    expect(row.isbn).toBe(exportIsbn('0141439512'));
    expect(row.isbn13).toBe(exportIsbn(''));
    expect(libraryTable.serialize([row])).toContain(',"=""0141439512""","=""""",');
  });
});

const GOODREADS_XML = `<rss><channel>
<item>
  <title>The Iliad</title>
  <book_id>1371</book_id>
  <author_name>Homer</author_name>
  <isbn>0140275363</isbn>
  <user_rating>5</user_rating>
  <user_read_at><![CDATA[Tue, 4 Aug 2026 00:00:00 +0000]]></user_read_at>
  <user_date_added><![CDATA[Tue, 01 Aug 2023 07:53:58 -0700]]></user_date_added>
  <user_shelves>books-that-changed-my-life</user_shelves>
  <average_rating>3.88</average_rating>
  <book_published>-750</book_published>
  <book id="1371"><num_pages>614</num_pages></book>
</item>
<item>
  <title>Crime &amp; Punishment</title>
  <book_id>7144</book_id>
  <author_name>Fyodor Dostoevsky</author_name>
  <user_rating></user_rating>
  <user_read_at></user_read_at>
  <user_date_added>not a date</user_date_added>
</item>
<item><title>No id</title></item>
</channel></rss>`;

describe('parseGoodreadsRss', () => {
  it('parses shelf items with the export-compatible fields', () => {
    const [iliad] = parseGoodreadsRss(GOODREADS_XML, 'read');
    expect(iliad).toEqual({
      bookId: '1371',
      title: 'The Iliad',
      author: 'Homer',
      isbn: '0140275363',
      rating: '5',
      averageRating: '3.88',
      pages: '614',
      published: '-750',
      readAt: '2026/08/04',
      dateAdded: '2023/08/01',
      shelves: 'books-that-changed-my-life',
      exclusiveShelf: 'read',
    });
  });

  it('decodes entities and defaults the missing and unparseable fields', () => {
    const [, crime] = parseGoodreadsRss(GOODREADS_XML, 'to-read');
    expect(crime).toMatchObject({
      title: 'Crime & Punishment',
      rating: '0',
      isbn: '',
      readAt: '',
      dateAdded: '',
      exclusiveShelf: 'to-read',
    });
  });

  it('skips items without a book id', () => {
    expect(parseGoodreadsRss(GOODREADS_XML, 'read').map((b) => b.bookId)).toEqual(['1371', '7144']);
  });
});
