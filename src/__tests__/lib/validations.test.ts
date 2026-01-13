import { describe, it, expect } from 'vitest';
import {
  slugSchema,
  emailSchema,
  contactFormSchema,
  viewTrackingSchema,
  reactionTrackingSchema,
  reactionTypeSchema,
  newsletterSubscribeSchema,
  slugQuerySchema,
  reactionQuerySchema,
  parseBody,
  parseQuery,
} from '@/lib/validations';

describe('slugSchema', () => {
  it('accepts valid slugs', () => {
    expect(slugSchema.safeParse('hello-world').success).toBe(true);
    expect(slugSchema.safeParse('my-blog-post').success).toBe(true);
    expect(slugSchema.safeParse('post123').success).toBe(true);
    expect(slugSchema.safeParse('a').success).toBe(true);
  });

  it('rejects invalid slugs', () => {
    expect(slugSchema.safeParse('').success).toBe(false);
    expect(slugSchema.safeParse('Hello-World').success).toBe(false);
    expect(slugSchema.safeParse('hello_world').success).toBe(false);
    expect(slugSchema.safeParse('hello--world').success).toBe(false);
    expect(slugSchema.safeParse('-hello').success).toBe(false);
    expect(slugSchema.safeParse('hello-').success).toBe(false);
  });

  it('rejects slugs that are too long', () => {
    const longSlug = 'a'.repeat(201);
    expect(slugSchema.safeParse(longSlug).success).toBe(false);
  });
});

describe('emailSchema', () => {
  it('accepts valid emails and normalizes them', () => {
    const result = emailSchema.safeParse('Test@Example.COM');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('test@example.com');
    }
  });

  it('trims whitespace', () => {
    const result = emailSchema.safeParse('  user@test.com  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('user@test.com');
    }
  });

  it('rejects invalid emails', () => {
    expect(emailSchema.safeParse('').success).toBe(false);
    expect(emailSchema.safeParse('invalid').success).toBe(false);
    expect(emailSchema.safeParse('no@domain').success).toBe(false);
    expect(emailSchema.safeParse('@example.com').success).toBe(false);
  });
});

describe('contactFormSchema', () => {
  it('accepts valid contact form data', () => {
    const result = contactFormSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello, this is a test message.',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.email).toBe('john@example.com');
    }
  });

  it('trims name and message', () => {
    const result = contactFormSchema.safeParse({
      name: '  John Doe  ',
      email: 'john@example.com',
      message: '  Hello  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.message).toBe('Hello');
    }
  });

  it('rejects empty name', () => {
    const result = contactFormSchema.safeParse({
      name: '',
      email: 'john@example.com',
      message: 'Hello',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = contactFormSchema.safeParse({
      name: 'John',
      message: 'Hello',
    });
    expect(result.success).toBe(false);
  });

  it('rejects message over 5000 characters', () => {
    const result = contactFormSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      message: 'a'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});

describe('viewTrackingSchema', () => {
  it('accepts valid view tracking data', () => {
    const result = viewTrackingSchema.safeParse({
      slug: 'my-blog-post',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid slug', () => {
    const result = viewTrackingSchema.safeParse({
      slug: 'Invalid Slug',
    });
    expect(result.success).toBe(false);
  });
});

describe('reactionTypeSchema', () => {
  it('accepts like and bookmark', () => {
    expect(reactionTypeSchema.safeParse('like').success).toBe(true);
    expect(reactionTypeSchema.safeParse('bookmark').success).toBe(true);
  });

  it('rejects other values', () => {
    expect(reactionTypeSchema.safeParse('upvote').success).toBe(false);
    expect(reactionTypeSchema.safeParse('').success).toBe(false);
    expect(reactionTypeSchema.safeParse('Like').success).toBe(false);
  });
});

describe('reactionTrackingSchema', () => {
  it('accepts valid reaction data', () => {
    const result = reactionTrackingSchema.safeParse({
      slug: 'my-post',
      type: 'like',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid type', () => {
    const result = reactionTrackingSchema.safeParse({
      slug: 'my-post',
      type: 'upvote',
    });
    expect(result.success).toBe(false);
  });
});

describe('newsletterSubscribeSchema', () => {
  it('accepts valid email', () => {
    const result = newsletterSubscribeSchema.safeParse({
      email: 'subscriber@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = newsletterSubscribeSchema.safeParse({
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });
});

describe('parseBody helper', () => {
  it('returns success with parsed data for valid input', () => {
    const result = parseBody(slugQuerySchema, { slug: 'valid-slug' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe('valid-slug');
    }
  });

  it('returns error message for invalid input', () => {
    const result = parseBody(slugQuerySchema, { slug: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});

describe('parseQuery helper', () => {
  it('parses URL search params', () => {
    const params = new URLSearchParams('slug=test-post');
    const result = parseQuery(slugQuerySchema, params);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe('test-post');
    }
  });

  it('parses multiple params', () => {
    const params = new URLSearchParams('slug=test-post&type=like');
    const result = parseQuery(reactionQuerySchema, params);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe('test-post');
      expect(result.data.type).toBe('like');
    }
  });

  it('returns error for missing params', () => {
    const params = new URLSearchParams('');
    const result = parseQuery(slugQuerySchema, params);
    expect(result.success).toBe(false);
  });
});
