// ============================================
// Sanitizer — Pure Function
// Source: TRD §6.5
// Strips HTML, markdown, collapses whitespace
// ============================================

/**
 * Sanitize AI output text to safe, plain text.
 * Strips HTML tags, markdown syntax, markdown links,
 * collapses whitespace, trims, and truncates to 300 chars.
 *
 * @param text — raw AI response text
 * @returns clean plain text, max 300 chars
 */
export function sanitize(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let clean = text;

  // Strip HTML tags
  clean = clean.replace(/<[^>]*>/g, '');

  // Strip markdown links [text](url) → text
  clean = clean.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

  // Strip markdown bold/italic ** __ * _
  clean = clean.replace(/(\*\*|__)(.*?)\1/g, '$2');
  clean = clean.replace(/(\*|_)(.*?)\1/g, '$2');

  // Strip markdown headers # ## ### etc.
  clean = clean.replace(/^#{1,6}\s*/gm, '');

  // Strip markdown code blocks ```...```
  clean = clean.replace(/```[\s\S]*?```/g, '');
  clean = clean.replace(/`([^`]*)`/g, '$1');

  // Strip markdown list markers
  clean = clean.replace(/^\s*[-*+]\s+/gm, '');
  clean = clean.replace(/^\s*\d+\.\s+/gm, '');

  // Collapse multiple newlines/spaces into single space
  clean = clean.replace(/\s+/g, ' ');

  // Trim
  clean = clean.trim();

  // Truncate to 300 chars
  if (clean.length > 300) {
    clean = clean.slice(0, 300);
  }

  return clean;
}
