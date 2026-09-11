/**
 * Zod schemas for API validation
 *
 * Centralizes all validation logic for type-safe, runtime-validated API inputs.
 * Each schema includes descriptive error messages for better UX.
 */

import { z } from 'zod';

// Custom refinements
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Blog slug validation - lowercase alphanumeric with hyphens
 */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(200, 'Slug is too long')
  .regex(slugPattern, 'Invalid slug format');

/**
 * The caps the contact form is judged against, in one place because the form
 * itself has to know them.
 *
 * These lived only in the schemas below, so the inputs carried no `maxLength`
 * and a reader learned that their message was one character over the limit by
 * writing it, sending it, and waiting for a round trip to say no. The form now
 * reads these for `maxLength` and for the countdown it shows near the cap;
 * `validations.test.ts` asserts the schema still rejects at limit + 1 and
 * accepts at the limit, so the two cannot drift apart silently.
 *
 * Declared above `emailSchema` because that schema reads it at module
 * evaluation time, and a `const` below it would still be in the temporal dead
 * zone.
 */
export const CONTACT_FIELD_LIMITS = {
  name: 100,
  email: 254,
  subject: 200,
  message: 5000,
} as const;

/**
 * Email validation with proper format checking
 * Uses preprocess to trim before validation
 */
export const emailSchema = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
  z
    .string()
    .min(1, 'Email is required')
    .max(CONTACT_FIELD_LIMITS.email, 'Email is too long')
    .email('Invalid email format')
);

/**
 * Contact form validation
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(CONTACT_FIELD_LIMITS.name, 'Name is too long')
    .transform((name) => name.trim()),
  email: emailSchema,
  /**
   * The form has always collected this, marked it required, and had it thrown
   * away here — `z.object` strips unknown keys silently, so a reader typed a
   * subject, the request succeeded, and the line never reached the inbox.
   */
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(CONTACT_FIELD_LIMITS.subject, 'Subject is too long')
    .transform((subject) => subject.trim()),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(
      CONTACT_FIELD_LIMITS.message,
      `Message is too long (max ${CONTACT_FIELD_LIMITS.message} characters)`
    )
    .transform((msg) => msg.trim()),
});

/**
 * View tracking - POST body
 */
export const viewTrackingSchema = z.object({
  slug: slugSchema,
});

/**
 * Newsletter subscription
 */
export const newsletterSubscribeSchema = z.object({
  email: emailSchema,
  topics: z
    .array(
      z
        .string()
        .min(1, "Topic is required")
        .max(64, "Topic is too long")
        .transform((t) => t.trim())
    )
    .max(6, "Too many topics (max 6)")
    .optional(),
  source: z
    .string()
    .max(300, "Source is too long")
    .transform((s) => s.trim())
    .optional(),
});

/**
 * Query parameter schemas for GET/DELETE requests
 */
export const slugQuerySchema = z.object({
  slug: slugSchema,
});

/**
 * Helper function to safely parse and return typed errors
 */
export function parseBody<T extends z.ZodSchema>(
  schema: T,
  data: unknown
):
  | { success: true; data: z.infer<T> }
  | { success: false; error: string; field?: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  // Return the first error message for simplicity
  // Zod 4 uses .issues, earlier versions use .errors
  const issues =
    result.error.issues ||
    (
      result.error as {
        errors?: Array<{ message?: string; path?: Array<string | number> }>;
      }
    ).errors;
  const firstError = issues?.[0];
  // The path travels with the message so a form can put "Subject is required"
  // under the subject field instead of at the bottom of the form, where the
  // reader has to work out which of four inputs it is about.
  const field = firstError?.path?.[0];
  return {
    success: false,
    error: firstError?.message || 'Validation failed',
    ...(typeof field === 'string' ? { field } : {}),
  };
}

/**
 * Helper for query parameter validation
 */
export function parseQuery<T extends z.ZodSchema>(
  schema: T,
  searchParams: URLSearchParams
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return parseBody(schema, params);
}

/**
 * Chat API request validation
 *
 * Deliberately no `provider` / `model` fields: `/api/chat` does not route on
 * them. `generateChatAnswer` walks a fixed ladder (see CHAT_PROVIDERS in
 * `@/lib/chat/providers`) and picks the first provider that answers, so a
 * caller-supplied provider would be validated and then ignored — an interface
 * advertising capability that does not exist. The response still reports which
 * provider actually answered. See validations.test.ts for the drift guard.
 */
export const chatRequestSchema = z.object({
  query: z
    .string()
    .min(1, 'Query is required')
    .max(1000, 'Query too long (max 1000 characters)'),
  contextSlug: slugSchema.optional(),
});

/**
 * Summarize API request validation
 */
export const summarizeSchema = z.object({
  content: z.string().min(1, 'Content is required').max(50000, 'Content too long (max 50000 characters)'),
  type: z.enum(['summary', 'takeaways']).default('summary'),
});

/**
 * Newsletter unsubscribe token validation
 */
export const unsubscribeSchema = z.object({
  token: z.string().min(1, 'Unsubscribe token is required').max(256, 'Token is too long'),
});
