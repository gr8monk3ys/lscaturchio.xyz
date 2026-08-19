import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BlogJsonLd } from '@/components/blog/blog-json-ld';
import { SITE_URL } from '@/lib/site-url';

const base = {
  title: 'Degrowth Isn’t Primitivism',
  description: 'Throughput, not quality of life.',
  date: '2025-09-01',
  image: '/images/blog/degrowth.webp',
  tags: ['economics', 'environment'],
  url: 'https://www.lscaturchio.xyz/blog/degrowth-isnt-primitivism',
};

function renderSchema(props = {}) {
  render(<BlogJsonLd {...base} {...props} />);
  const script = document.getElementById('blog-schema');
  expect(script).not.toBeNull();
  expect(script).toHaveAttribute('type', 'application/ld+json');
  return JSON.parse(script!.textContent ?? '{}');
}

describe('BlogJsonLd', () => {
  it('emits a valid BlogPosting schema with absolute image URL', () => {
    const schema = renderSchema();
    expect(schema['@type']).toBe('BlogPosting');
    expect(schema.headline).toBe(base.title);
    expect(schema.datePublished).toBe('2025-09-01');
    expect(schema.image).toBe(`${SITE_URL}${base.image}`);
    expect(schema.mainEntityOfPage['@id']).toBe(base.url);
    expect(schema.keywords).toBe('economics, environment');
  });

  it('omits dateModified unless an updated date is given', () => {
    const schema = renderSchema();
    expect(schema).not.toHaveProperty('dateModified');
  });

  it('includes dateModified when updated is set', () => {
    const schema = renderSchema({ updated: '2026-01-15' });
    expect(schema.dateModified).toBe('2026-01-15');
  });
});
