import { describe, it, expect } from 'vitest';
import {
  parseLetterboxdRss,
  parseGoodreadsRss,
  mergeDiary,
  mergeRatings,
  mergeWatched,
  mergeReviews,
  upsertGoodreads,
} from '@/lib/media-refresh';

const LETTERBOXD_XML = `<rss><channel>
<item> <title>Ikiru, 1952 - ★★★★★</title> <link>https://letterboxd.com/gr8monk3ys/film/ikiru/</link> <letterboxd:watchedDate>2026-08-01</letterboxd:watchedDate> <letterboxd:rewatch>Yes</letterboxd:rewatch> <letterboxd:filmTitle>Ikiru</letterboxd:filmTitle> <letterboxd:filmYear>1952</letterboxd:filmYear> <letterboxd:memberRating>5.0</letterboxd:memberRating> <description><![CDATA[ <p><img src="poster.jpg"/></p> <p>Still lands, harder now.</p> ]]></description> </item>
<item> <title>The Odyssey, 2026 - ★★★★</title> <link>https://letterboxd.com/gr8monk3ys/film/the-odyssey-2026/</link> <letterboxd:watchedDate>2026-08-06</letterboxd:watchedDate> <letterboxd:rewatch>No</letterboxd:rewatch> <letterboxd:filmTitle>The Odyssey</letterboxd:filmTitle> <letterboxd:filmYear>2026</letterboxd:filmYear> <letterboxd:memberRating>4.0</letterboxd:memberRating> <description><![CDATA[ <p><img src="poster.jpg"/></p> <p>Watched on Thursday August 6, 2026.</p> ]]></description> </item>
<item> <title>A list, not a film</title> <link>https://letterboxd.com/gr8monk3ys/list/x/</link> <description><![CDATA[ <p>list stuff</p> ]]></description> </item>
</channel></rss>`;

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
</channel></rss>`;

describe('parseLetterboxdRss', () => {
  it('parses diary entries and skips non-film items', () => {
    const entries = parseLetterboxdRss(LETTERBOXD_XML);
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      title: 'Ikiru',
      year: '1952',
      rating: '5.0',
      watchedDate: '2026-08-01',
      rewatch: 'Yes',
      review: 'Still lands, harder now.',
    });
  });

  it('treats the "Watched on <date>." filler as no review', () => {
    const [, odyssey] = parseLetterboxdRss(LETTERBOXD_XML);
    expect(odyssey.review).toBe('');
  });

  it('does not double-unescape entities, and decodes only after stripping tags', () => {
    const xml = `<rss><channel><item>
      <letterboxd:filmTitle>Fear &amp;amp; Loathing</letterboxd:filmTitle>
      <letterboxd:filmYear>1998</letterboxd:filmYear>
      <letterboxd:watchedDate>2026-08-01</letterboxd:watchedDate>
      <letterboxd:rewatch>No</letterboxd:rewatch>
      <link>x</link>
      <description><![CDATA[ <p><img src="p.jpg"/></p> <p>I <b>&lt;3</b> this &amp; that</p> ]]></description>
    </item></channel></rss>`;
    const [entry] = parseLetterboxdRss(xml);

    // "&amp;amp;" is the literal text "&amp;" — one decode, not two.
    expect(entry.title).toBe('Fear &amp; Loathing');
    // The member's escaped "&lt;3" is a literal "<3": tags must strip before
    // entities decode, or the heart gets eaten as a half-open tag.
    expect(entry.review).toBe('I <3 this & that');
  });
});

describe('parseGoodreadsRss', () => {
  it('parses shelf items with the export-compatible fields', () => {
    const [iliad] = parseGoodreadsRss(GOODREADS_XML, 'read');
    expect(iliad).toMatchObject({
      bookId: '1371',
      title: 'The Iliad',
      author: 'Homer',
      isbn: '0140275363',
      rating: '5',
      pages: '614',
      published: '-750',
      readAt: '2026/08/04',
      shelves: 'books-that-changed-my-life',
      exclusiveShelf: 'read',
    });
  });
});

const entries = parseLetterboxdRss(LETTERBOXD_XML);

describe('Letterboxd merges', () => {
  const existingDiary = [
    { Date: '2026-08-01', Name: 'Ikiru', Year: '1952', 'Letterboxd URI': 'https://boxd.it/x', Rating: '5', Rewatch: 'Yes', Tags: '', 'Watched Date': '2026-08-01' },
  ];

  it('mergeDiary appends only unseen viewings (same film, new date = new row)', () => {
    const result = mergeDiary(existingDiary, entries);
    expect(result.added).toBe(1);
    expect(result.rows.at(-1)).toMatchObject({ Name: 'The Odyssey', 'Watched Date': '2026-08-06' });

    // Idempotent: running the same merge again changes nothing.
    const again = mergeDiary(result.rows, entries);
    expect(again.added).toBe(0);
  });

  it('mergeRatings appends new films and updates a changed rating in place', () => {
    const ratings = [
      { Date: '2025-01-07', Name: 'Ikiru', Year: '1952', 'Letterboxd URI': 'https://boxd.it/251c', Rating: '4.5' },
    ];
    const result = mergeRatings(ratings, entries);
    expect(result.added).toBe(1); // The Odyssey
    expect(result.updated).toBe(1); // Ikiru 4.5 → 5.0
    expect(result.rows[0].Rating).toBe('5.0');
  });

  it('mergeWatched dedupes by film', () => {
    const watched = [{ Date: '2025-01-07', Name: 'Ikiru', Year: '1952', 'Letterboxd URI': 'x' }];
    const result = mergeWatched(watched, entries);
    expect(result.added).toBe(1);
    expect(result.rows.map((r) => r.Name)).toEqual(['Ikiru', 'The Odyssey']);
  });

  it('mergeReviews only appends entries with actual review text', () => {
    const result = mergeReviews([], entries);
    expect(result.added).toBe(1);
    expect(result.rows[0]).toMatchObject({ Name: 'Ikiru', Review: 'Still lands, harder now.' });
  });
});

describe('upsertGoodreads', () => {
  const books = parseGoodreadsRss(GOODREADS_XML, 'read');

  it('updates an existing row in place (shelf move, new rating) and counts it once', () => {
    const rows = [
      {
        'Book Id': '1371',
        Title: 'The Iliad',
        Author: 'Homer',
        ISBN: '="0140275363"',
        'My Rating': '0',
        'Exclusive Shelf': 'currently-reading',
        'Date Read': '',
        Bookshelves: '',
        Binding: 'Paperback', // export-only column must survive untouched
      },
    ];
    const result = upsertGoodreads(rows, books);
    expect(result.updated).toBe(1);
    expect(result.added).toBe(0);
    expect(result.rows[0]).toMatchObject({
      'My Rating': '5',
      'Exclusive Shelf': 'read',
      'Date Read': '2026/08/04',
      Binding: 'Paperback',
    });
    // Stale exclusive-shelf leakage in Bookshelves gets cleared, not kept.
    expect(result.rows[0]['Bookshelves']).toBe('books-that-changed-my-life');
  });

  it('appends unknown books with the export ISBN quoting', () => {
    const result = upsertGoodreads([], books);
    expect(result.added).toBe(1);
    expect(result.rows[0]['ISBN']).toBe('="0140275363"');
    expect(result.rows[0]['Read Count']).toBe('1');
  });

  it('is idempotent', () => {
    const first = upsertGoodreads([], books);
    const second = upsertGoodreads(first.rows, books);
    expect(second.added + second.updated).toBe(0);
  });
});
