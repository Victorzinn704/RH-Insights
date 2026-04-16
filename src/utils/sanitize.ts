import DOMPurify from 'dompurify';

// DOMPurify config for AI-generated markdown → HTML
const MARKUP_CONFIG: {
  ALLOWED_TAGS: string[];
  ALLOWED_ATTR: string[];
  ADD_ATTR: string[];
  FORBID_ATTR: string[];
  FORBID_TAGS: string[];
  KEEP_CONTENT: boolean;
} = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'strong', 'em', 'b', 'i',
    'ul', 'ol', 'li',
    'code', 'pre', 'blockquote',
    'a', 'br', 'hr',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  ALLOWED_ATTR: ['href', 'title', 'class', 'target', 'rel'],
  ADD_ATTR: ['target', 'rel'],
  FORBID_ATTR: ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur', 'style'],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'img'],
  KEEP_CONTENT: true,
};

/**
 * Sanitize AI-generated markdown/HTML output.
 * Strips all dangerous tags and attributes, keeps only safe formatting.
 */
export function sanitizeMarkdown(html: string | null): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, MARKUP_CONFIG);
}

// Patterns for script/XSS injection in plain text inputs
const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<script[\s\S]*?\/?>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /data\s*:\s*text\s*\/\s*html/gi,
  /on(?:error|click|load|mouseover|focus|blur|submit|change|keyup|keydown|mouseout|mouseenter|mouseleave)\s*=/gi,
  /expression\s*\(/gi,
  /url\s*\(\s*["']?\s*javascript:/gi,
  /<\s*iframe[\s\S]*?>/gi,
  /<\s*object[\s\S]*?>/gi,
  /<\s*embed[\s\S]*?>/gi,
  /<\s*form[\s\S]*?>/gi,
  /<\s*img[\s\S]*?on\w+\s*=/gi,
];

/**
 * Sanitize a plain text input before sending to Firestore or AI.
 * Removes script tags, event handlers, javascript: URIs, and other XSS vectors.
 * Also truncates to maxLength.
 */
export function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input) return '';
  let sanitized = input;
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  // Trim and truncate
  sanitized = sanitized.trim();
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }
  return sanitized;
}

/**
 * Validate that a URL is safe to use as an img/src/srcset source.
 * Only allows https:// from known safe domains.
 */
const SAFE_URL_PATTERN = /^https:\/\/(?:[\w-]+\.)+(?:googleusercontent\.com|google\.com|firebaseapp\.com|gstatic\.com|cloudflare\.com|githubusercontent\.com|github\.com|unsplash\.com|pexels\.com|pixabay\.com)(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i;

export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return SAFE_URL_PATTERN.test(url);
}
