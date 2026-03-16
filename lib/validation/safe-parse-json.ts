/**
 * Safe JSON parse with structured result. No thrown exceptions.
 */

export type SafeParseResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string }

/**
 * Parse JSON safely. Returns { ok: true, data } or { ok: false, error }.
 */
export function safeParseJson(text: string): SafeParseResult {
  if (typeof text !== 'string') {
    return { ok: false, error: 'Input must be a string.' }
  }

  const trimmed = text.trim()
  if (!trimmed) {
    return { ok: false, error: 'Empty input.' }
  }

  try {
    const data = JSON.parse(trimmed)
    return { ok: true, data }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON.'
    return { ok: false, error: message }
  }
}
