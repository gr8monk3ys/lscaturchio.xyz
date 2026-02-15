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
 * Email validation with proper format checking
 * Uses preprocess to trim before validation
 */
export const emailSchema = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim().toLowerCase() : val),
  z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email is too long')
    .email('Invalid email format')
);

/**
 * Contact form validation
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .transform((name) => name.trim()),
  email: emailSchema,
  message: z
    .string()
    .min(1, 'Message is required')
    .max(5000, 'Message is too long (max 5000 characters)')
    .transform((msg) => msg.trim()),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

/**
 * View tracking - POST body
 */
export const viewTrackingSchema = z.object({
  slug: slugSchema,
});

export type ViewTrackingInput = z.infer<typeof viewTrackingSchema>;

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

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

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
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  // Return the first error message for simplicity
  // Zod 4 uses .issues, earlier versions use .errors
  const issues = result.error.issues || (result.error as { errors?: Array<{ message?: string }> }).errors;
  const firstError = issues?.[0];
  return { success: false, error: firstError?.message || 'Validation failed' };
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
 * AI Provider enum for chat API
 */
export const aiProviderSchema = z.enum(['openai', 'anthropic', 'google'], {
  message: "Provider must be 'openai', 'anthropic', or 'google'",
});

export type AIProviderInput = z.infer<typeof aiProviderSchema>;

/**
 * Chat API request validation
 * Validates provider, model, and query parameters
 */
export const chatRequestSchema = z.object({
  query: z
    .string()
    .min(1, 'Query is required')
    .max(1000, 'Query too long (max 1000 characters)'),
  contextSlug: slugSchema.optional(),
  provider: aiProviderSchema.optional(),
  model: z
    .string()
    .max(100, 'Model name too long')
    .optional(),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;
