/**
 * Validation and sanitization utilities to prevent XSS and injection attacks
 */

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
