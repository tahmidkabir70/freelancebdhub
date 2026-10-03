/**
 * FREELANCE BD HUB — HTML SANITIZER & STRING UTILITIES
 */

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function stripTags(str) {
  if (!str) return '';
  return String(str).replace(/<[^>]*>?/gm, '');
}

export function trimLength(str, max = 160) {
  if (!str) return '';
  const clean = stripTags(str).trim();
  if (clean.length <= max) return clean;
  return clean.substring(0, max).trim() + '...';
}
