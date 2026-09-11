import { describe, it, expect } from 'vitest';
import {
  slugSchema,
  emailSchema,
  contactFormSchema,
  CONTACT_FIELD_LIMITS,
  viewTrackingSchema,
  newsletterSubscribeSchema,
  slugQuerySchema,
  parseBody,
  parseQuery,
  chatRequestSchema,
} from '@/lib/validations';
import { CHAT_PROVIDERS } from '@/lib/chat/providers';

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
      subject: 'Project scoping',
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
      subject: 'Project scoping',
      message: '  Hello  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.message).toBe('Hello');
    }
  });

  it('requires the subject the form has always collected', () => {
    // z.object strips unknown keys, so before `subject` was in the schema a
    // reader typed one, the request succeeded, and the line never reached the
    // inbox. The form marked the field required the whole time.
    const result = contactFormSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello.',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'subject')).toBe(true);
    }
  });

  it('carries the failing field back with the message', () => {
    const result = parseBody(contactFormSchema, {
      name: 'John Doe',
      email: 'not-an-email',
      subject: 'Project scoping',
      message: 'Hello.',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.field).toBe('email');
    }
  });

  it('rejects empty name', () => {
    const result = contactFormSchema.safeParse({
      name: '',
      email: 'john@example.com',
      subject: 'Project scoping',
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
      subject: 'Project scoping',
      message: 'a'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it('caps each text field exactly where CONTACT_FIELD_LIMITS says it does', () => {
    // The contact form reads these numbers for its `maxLength` attributes, so a
    // limit edited here and not there would put the browser's cap and the
    // server's cap in different places — which is the failure this constant
    // exists to prevent. Accepting at the limit matters as much as rejecting
    // past it: a `maxLength` one character tight silently eats the last one.
    const valid = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Project scoping',
      message: 'Hello.',
    };

    for (const field of ['name', 'subject', 'message'] as const) {
      const limit = CONTACT_FIELD_LIMITS[field];
      expect(
        contactFormSchema.safeParse({ ...valid, [field]: 'a'.repeat(limit) }).success,
        `${field} should accept exactly ${limit} characters`
      ).toBe(true);
      expect(
        contactFormSchema.safeParse({ ...valid, [field]: 'a'.repeat(limit + 1) }).success,
        `${field} should reject ${limit + 1} characters`
      ).toBe(false);
    }
  });

  it('caps the email field where CONTACT_FIELD_LIMITS.email says it does', () => {
    // Separate because an over-long email has to stay a valid address to prove
    // the length rule fired rather than the format rule.
    const domain = '@example.com';
    const atLimit = 'a'.repeat(CONTACT_FIELD_LIMITS.email - domain.length) + domain;
    expect(atLimit).toHaveLength(CONTACT_FIELD_LIMITS.email);

    const valid = { name: 'John', subject: 'Project scoping', message: 'Hello.' };
    expect(contactFormSchema.safeParse({ ...valid, email: atLimit }).success).toBe(true);
    expect(
      contactFormSchema.safeParse({ ...valid, email: `a${atLimit}` }).success
    ).toBe(false);
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
    // Note: Empty string fails the 'min' validation, not regex
    const result = parseBody(slugQuerySchema, { slug: 'INVALID-UPPERCASE' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
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

  it('parses slug param correctly', () => {
    const params = new URLSearchParams('slug=another-post');
    const result = parseQuery(slugQuerySchema, params);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe('another-post');
    }
  });

  it('returns error for missing params', () => {
    // Provide an invalid param value rather than empty - empty string triggers 'min' first
    const params = new URLSearchParams('slug=INVALID-UPPERCASE');
    const result = parseQuery(slugQuerySchema, params);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});

describe('chatRequestSchema provider drift guard', () => {
  // The schema once advertised 'anthropic' and 'google' — neither exists in the
  // ladder — and a 'model' field the route threw away. These tests fail if the
  // request contract and the real provider set are ever able to disagree again.
  const shape = chatRequestSchema.shape as Record<string, unknown>;

  it('advertises no provider the ladder cannot answer with', () => {
    const advertised: string[] =
      'provider' in shape
        ? ((shape.provider as { options?: string[]; _def?: { innerType?: { options?: string[] } } })
            .options ??
          (shape.provider as { _def?: { innerType?: { options?: string[] } } })._def?.innerType
            ?.options ??
          [])
        : [];
    const unroutable = advertised.filter(
      (p) => !(CHAT_PROVIDERS as readonly string[]).includes(p)
    );
    expect(unroutable).toEqual([]);
  });

  it('accepts only the fields the route actually reads', () => {
    expect(Object.keys(shape).sort()).toEqual(['contextSlug', 'query']);
  });

  it('drops a caller-supplied provider and model instead of pretending to honour them', () => {
    const parsed = chatRequestSchema.parse({
      query: 'who are you?',
      provider: 'google',
      model: 'gemini-2.0',
    });
    expect(parsed).not.toHaveProperty('provider');
    expect(parsed).not.toHaveProperty('model');
  });
});
