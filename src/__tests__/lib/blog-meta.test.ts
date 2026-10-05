import { describe, it, expect } from 'vitest';
import { parseMetaExport } from '@/lib/blog-meta';

const metaOf = (source: string) => parseMetaExport(source).meta;

describe('parseMetaExport().meta', () => {
  it('extracts supported literal fields from exported meta object', () => {
    const source = `
      export const meta = {
        title: "Post Title",
        description: "Post Description",
        date: "2025-02-13",
        updated: "2025-02-14",
        image: "/images/blog/post.webp",
        tags: ["tag-1", "tag-2"],
        series: "My Series",
        seriesOrder: 3,
      };

      ## Body
      Hello world.
    `;

    expect(metaOf(source)).toEqual({
      title: 'Post Title',
      description: 'Post Description',
      date: '2025-02-13',
      updated: '2025-02-14',
      image: '/images/blog/post.webp',
      tags: ['tag-1', 'tag-2'],
      syndication: undefined,
      series: 'My Series',
      seriesOrder: 3,
      stage: undefined,
    });
  });

  it('returns empty object when exported meta object is missing', () => {
    const source = `
      ## No meta here
      Just markdown content.
    `;

    expect(metaOf(source)).toEqual({});
  });

  it('does not get confused by code fences that include "export const meta"', () => {
    const source = `
      export const meta = {
        title: "Actual Title",
        description: "Actual Description",
        date: "2025-02-13",
        image: "/images/blog/actual.webp",
        tags: ["real"],
      };

      \`\`\`ts
      export const meta = {
        title: "Fake Title",
      };
      \`\`\`
    `;

    const meta = metaOf(source);
    expect(meta.title).toBe('Actual Title');
    expect(meta.description).toBe('Actual Description');
    expect(meta.tags).toEqual(['real']);
  });

  it('only extracts literal values and ignores computed expressions', () => {
    const source = `
      const dynamicTitle = "Dynamic";
      export const meta = {
        title: dynamicTitle,
        description: "Static Description",
        date: "2025-02-13",
        image: "/images/blog/static.webp",
        tags: ["ok", dynamicTitle],
      };
    `;

    expect(metaOf(source)).toEqual({
      title: undefined,
      description: 'Static Description',
      date: '2025-02-13',
      updated: undefined,
      image: '/images/blog/static.webp',
      tags: ['ok'],
      syndication: undefined,
      series: undefined,
      seriesOrder: undefined,
      stage: undefined,
    });
  });

  it('reads a valid stage literal', () => {
    const source = `
      export const meta = {
        title: "T",
        date: "2025-02-13",
        stage: "evergreen",
      };
    `;
    expect(metaOf(source).stage).toBe('evergreen');
  });

  it('drops an unrecognized stage value', () => {
    const source = `
      export const meta = {
        title: "T",
        date: "2025-02-13",
        stage: "evergeen",
      };
    `;
    expect(metaOf(source).stage).toBeUndefined();
  });

  it('omits stage when absent', () => {
    const source = `
      export const meta = { title: "T", date: "2025-02-13" };
    `;
    expect(metaOf(source).stage).toBeUndefined();
  });
});
