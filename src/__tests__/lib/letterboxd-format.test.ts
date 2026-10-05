import { describe, it, expect } from 'vitest';
import type { CsvTable } from '@/lib/csv';
import { roundTripCommitted } from './committed-csv';
import {
  diaryTable,
  filmKey,
  parseLetterboxdRss,
  parseRating,
  profileTable,
  ratingsTable,
  reviewsTable,
  watchedTable,
  watchlistTable,
} from '@/lib/letterboxd-format';

describe('export tables round-trip the committed CSVs', () => {
  // The refresh script reads each file through its table and writes it back.
  // For the same input, what it writes must be byte-for-byte what it read —
  // otherwise every refresh rewrites rows nobody changed.
  it.each([
    ['diary.csv', diaryTable],
    ['ratings.csv', ratingsTable],
    ['watched.csv', watchedTable],
    ['reviews.csv', reviewsTable],
    ['watchlist.csv', watchlistTable],
    ['profile.csv', profileTable],
  ] as const)('%s: parse → serialize is the identity', (file, table: CsvTable<string>) => {
    const { input, output, count } = roundTripCommitted(`letterboxd/${file}`, table);

    expect(count).toBeGreaterThan(0);
    expect(output).toBe(input);
  });

  it('maps columns to fields once, in both directions', () => {
    const [row] = diaryTable.parse(
      'Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date\n' +
        '2026-08-12,"Comma, The Movie",2024,https://boxd.it/x,4.0,Yes,,2026-08-11',
    );

    expect(row).toEqual({
      date: '2026-08-12',
      title: 'Comma, The Movie',
      year: '2024',
      uri: 'https://boxd.it/x',
      rating: '4.0',
      rewatch: 'Yes',
      tags: '',
      watchedDate: '2026-08-11',
    });
    expect(diaryTable.serialize([row])).toBe(
      'Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date\n' +
        '2026-08-12,"Comma, The Movie",2024,https://boxd.it/x,4.0,Yes,,2026-08-11\n',
    );
  });
});

describe('parseRating', () => {
  it('accepts half-stars from 0.5 to 5', () => {
    expect(parseRating('0.5')).toBe(0.5);
    expect(parseRating('3.5')).toBe(3.5);
    expect(parseRating('5.0')).toBe(5);
    expect(parseRating('5')).toBe(5);
  });

  it('treats empty, junk and out-of-range values as no rating', () => {
    expect(parseRating('')).toBeNull();
    expect(parseRating('abc')).toBeNull();
    expect(parseRating('0')).toBeNull();
    expect(parseRating('999')).toBeNull();
    expect(parseRating('-1')).toBeNull();
  });
});

describe('filmKey', () => {
  it('joins on case-insensitive title plus year, ignoring stray whitespace', () => {
    expect(filmKey(' Ikiru ', '1952 ')).toBe(filmKey('ikiru', '1952'));
    expect(filmKey('Ikiru', '1952')).not.toBe(filmKey('Ikiru', '1953'));
  });
});

const item = (body: string) => `<item>${body}</item>`;

const LETTERBOXD_XML = `<rss><channel>
${item(`<title>Ikiru, 1952 - ★★★★★</title> <link>https://letterboxd.com/gr8monk3ys/film/ikiru/</link> <letterboxd:watchedDate>2026-08-01</letterboxd:watchedDate> <letterboxd:rewatch>Yes</letterboxd:rewatch> <letterboxd:filmTitle>Ikiru</letterboxd:filmTitle> <letterboxd:filmYear>1952</letterboxd:filmYear> <letterboxd:memberRating>5.0</letterboxd:memberRating> <description><![CDATA[ <p><img src="poster.jpg"/></p> <p>Still lands, harder now.</p> ]]></description>`)}
${item(`<title>The Odyssey, 2026 - ★★★★</title> <link>https://letterboxd.com/gr8monk3ys/film/the-odyssey-2026/</link> <letterboxd:watchedDate>2026-08-06</letterboxd:watchedDate> <letterboxd:rewatch>No</letterboxd:rewatch> <letterboxd:filmTitle>The Odyssey</letterboxd:filmTitle> <letterboxd:filmYear>2026</letterboxd:filmYear> <letterboxd:memberRating>4.0</letterboxd:memberRating> <description><![CDATA[ <p><img src="poster.jpg"/></p> <p>Watched on Thursday August 6, 2026.</p> ]]></description>`)}
${item(`<title>A list, not a film</title> <link>https://letterboxd.com/gr8monk3ys/list/x/</link> <description><![CDATA[ <p>list stuff</p> ]]></description>`)}
</channel></rss>`;

/** A single film item with the given extra tags. */
const film = (tags: string) =>
  `<rss><channel>${item(`<letterboxd:filmTitle>X</letterboxd:filmTitle><letterboxd:filmYear>2026</letterboxd:filmYear><link>x</link>${tags}`)}</channel></rss>`;

describe('parseLetterboxdRss', () => {
  it('parses film entries in feed order and skips non-film items', () => {
    const entries = parseLetterboxdRss(LETTERBOXD_XML);

    expect(entries.map((e) => e.title)).toEqual(['Ikiru', 'The Odyssey']);
    expect(entries[0]).toEqual({
      title: 'Ikiru',
      year: '1952',
      link: 'https://letterboxd.com/gr8monk3ys/film/ikiru/',
      rating: '5.0',
      watchedDate: '2026-08-01',
      rewatch: true,
      review: 'Still lands, harder now.',
    });
  });

  it('keeps the feed’s rating text so the export keeps its "4.0" form', () => {
    const [, odyssey] = parseLetterboxdRss(LETTERBOXD_XML);
    expect(odyssey).toMatchObject({ rating: '4.0', rewatch: false });
  });

  it('drops an out-of-range rating rather than passing it on', () => {
    // One rule for every consumer: the homepage must not render "999★", and
    // the refresh must not write it into ratings.csv.
    expect(parseLetterboxdRss(film('<letterboxd:memberRating>999</letterboxd:memberRating>'))[0].rating).toBe('');
    expect(parseLetterboxdRss(film('<letterboxd:memberRating>0</letterboxd:memberRating>'))[0].rating).toBe('');
    expect(parseLetterboxdRss(film(''))[0].rating).toBe('');
  });

  it('keeps an entry without a watch date, marked null', () => {
    // The live "last watch" wants it; the refresh filters it out (datedEntries).
    const [entry] = parseLetterboxdRss(film('<letterboxd:memberRating>3.5</letterboxd:memberRating>'));
    expect(entry).toMatchObject({ title: 'X', rating: '3.5', watchedDate: null });
  });

  it('treats the "Watched on <date>." filler as no review', () => {
    const [, odyssey] = parseLetterboxdRss(LETTERBOXD_XML);
    expect(odyssey.review).toBe('');
  });

  it('drops the spoiler notice from a review', () => {
    const [entry] = parseLetterboxdRss(
      film('<description><![CDATA[ <p><img src="p.jpg"/></p> <p>This review may contain spoilers.</p> <p>The ending.</p> ]]></description>'),
    );
    expect(entry.review).toBe('The ending.');
  });

  it('does not double-unescape entities, and decodes only after stripping tags', () => {
    const [entry] = parseLetterboxdRss(`<rss><channel><item>
      <letterboxd:filmTitle>Fear &amp;amp; Loathing</letterboxd:filmTitle>
      <letterboxd:filmYear>1998</letterboxd:filmYear>
      <link>x</link>
      <description><![CDATA[ <p><img src="p.jpg"/></p> <p>I <b>&lt;3</b> this &amp; that &quot;a&quot; it&#39;s &gt;</p> ]]></description>
    </item></channel></rss>`);

    // "&amp;amp;" is the literal text "&amp;" — one decode, not two.
    expect(entry.title).toBe('Fear &amp; Loathing');
    // The member's escaped "&lt;3" is a literal "<3": tags must strip before
    // entities decode, or the heart gets eaten as a half-open tag.
    expect(entry.review).toBe('I <3 this & that "a" it\'s >');
  });

  it('leaves no angle bracket behind, even for nested or unbalanced markup', () => {
    const [entry] = parseLetterboxdRss(
      film('<description><![CDATA[ <p><img src="p.jpg"/></p> <p>a <scr<script>ipt> b <em>fine</em> c <</p> ]]></description>'),
    );
    expect(entry.review).not.toMatch(/[<>]/);
    expect(entry.review).toContain('fine');
  });

  it('returns nothing for a document with no film items', () => {
    expect(parseLetterboxdRss('<rss><channel><item><title>just a review</title></item></channel></rss>')).toEqual([]);
    expect(parseLetterboxdRss('')).toEqual([]);
  });
});
