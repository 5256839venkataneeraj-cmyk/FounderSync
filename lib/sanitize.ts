import DOMPurify from 'dompurify';

/**
 * Sanitizes any raw HTML string using DOMPurify to eliminate Cross-Site Scripting (XSS).
 * Safe for client-side and hybrid rendering environments.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';

  // In browser runtime, use DOMPurify
  if (typeof window !== 'undefined' && typeof DOMPurify.sanitize === 'function') {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        'b',
        'i',
        'em',
        'strong',
        'a',
        'p',
        'span',
        'ul',
        'ol',
        'li',
        'br',
        'code',
        'pre',
        'blockquote',
        'h1',
        'h2',
        'h3',
        'h4',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'title'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed', 'form'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'data-*'],
    });
  }

  // Server-side fallback regex sanitizer
  return dirty
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:[^"']*/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '');
}

/**
 * Strips script tags, HTML entities, and dangerous characters from raw text inputs.
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[<>]/g, '')       // Strip stray angle brackets
    .trim();
}
