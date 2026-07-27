// ═══════════════════════════════════════
// Meu Custo — Sanitização (DOMPurify)
// ═══════════════════════════════════════

import DOMPurify from "dompurify";

/**
 * Sanitiza string para prevenir XSS.
 * Remove tags HTML, scripts e atributos perigosos.
 */
export function sanitize(input: string): string {
  if (typeof window === "undefined") {
    // SSR fallback: remove tags básicas
    return input.replace(/<[^>]*>/g, "");
  }
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // não permitir nenhuma tag HTML
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitiza e limita tamanho de string.
 * Previne stored XSS via localStorage.
 */
export function sanitizeAndTrim(input: string, maxLength = 200): string {
  return sanitize(input).trim().slice(0, maxLength);
}
