/**
 * Validation and sanitization utilities to prevent XSS and injection attacks
 */

// Valid slug pattern: lowercase letters, numbers, and hyphens only
const VALID_SLUG_REGEX = /^[a-z0-9-]+$/;

// RFC 5322 compliant email regex (simplified but robust)
// - Requires 1+ chars before @
// - Disallows consecutive dots in local part
// - Allows common special chars: . _ - +
// - Requires valid domain format with 2+ char TLD
const EMAIL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

/**
 * Validates an email address
 * @param email - The email to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string' || email.length === 0 || email.length > 254) {
    return false;
  }
  // Check for consecutive dots which the regex doesn't fully catch
  if (email.includes('..')) {
    return false;
  }
  return EMAIL_REGEX.test(email);
}

/**
 * Validates a blog post slug
 * @param slug - The slug to validate
 * @returns true if valid, false otherwise
 */
export function isValidSlug(slug: string): boolean {
  if (typeof slug !== 'string' || slug.length === 0 || slug.length > 200) {
    return false;
  }
  return VALID_SLUG_REGEX.test(slug);
}

/**
 * Validates and normalizes pagination parameters
 * @param limit - The requested limit (items per page)
 * @param offset - The requested offset (skip count)
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @param maxOffset - Maximum allowed offset (default: 10000)
 * @returns Normalized { limit, offset } within valid bounds
 */
export function validatePagination(
  limit: number | string | null,
  offset: number | string | null,
  maxLimit: number = 100,
  maxOffset: number = 10000
): { limit: number; offset: number } {
  const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : (limit ?? 10);
  const parsedOffset = typeof offset === 'string' ? parseInt(offset, 10) : (offset ?? 0);

  return {
    limit: Math.max(1, Math.min(isNaN(parsedLimit) ? 10 : parsedLimit, maxLimit)),
    offset: Math.max(0, Math.min(isNaN(parsedOffset) ? 0 : parsedOffset, maxOffset)),
  };
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param unsafe - The potentially unsafe string to escape
 * @returns The escaped string safe for HTML insertion
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') {
    return '';
  }

  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes a string for safe use in HTML email content
 * Escapes HTML entities and converts newlines to <br> tags
 * @param text - The text to sanitize
 * @returns HTML-safe string with preserved line breaks
 */
export function sanitizeForHtmlEmail(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  return escapeHtml(text.trim()).replace(/\n/g, '<br>');
}

/**
 * Validates and sanitizes an email subject line
 * Prevents header injection attacks
 * @param subject - The subject to sanitize
 * @returns Sanitized subject safe for email headers
 */
export function sanitizeEmailSubject(subject: string): string {
  if (typeof subject !== 'string') {
    return '';
  }

  // Remove any newlines or carriage returns to prevent header injection
  return subject
    .replace(/[\r\n]/g, ' ')
    .trim()
    .slice(0, 200); // Limit length
}
