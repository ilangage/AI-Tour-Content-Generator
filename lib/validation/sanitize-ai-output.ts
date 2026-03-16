/**
 * Sanitize raw AI output before JSON parse.
 * Conservative: remove markdown fences, trim, optionally isolate JSON.
 * Preserves original for debugging.
 */

export interface SanitizeResult {
  /** Sanitized text ready for parse attempt. */
  sanitized: string
  /** Original input (for debugging only). */
  original: string
}

const MARKDOWN_JSON_FENCE = /^```(?:json)?\s*\n?|\n?```\s*$/g

/**
 * Remove markdown code fences (e.g. ```json ... ```), trim whitespace.
 * Does not aggressively mutate; only fence stripping and trim.
 */
export function sanitizeAiOutput(raw: string): SanitizeResult {
  const original = raw
  let sanitized = raw.trim()

  sanitized = sanitized.replace(MARKDOWN_JSON_FENCE, '').trim()

  return { sanitized, original }
}

/**
 * Conservatively try to isolate the first top-level JSON object block.
 * Only used when the string may contain leading/trailing non-JSON text.
 * Looks for first { and matching }; does not parse or validate structure.
 */
export function isolateJsonObject(text: string): string {
  const trimmed = text.trim()
  const start = trimmed.indexOf('{')
  if (start === -1) return trimmed

  let depth = 0
  let inString = false
  let escape = false
  let quote: string | null = null

  for (let i = start; i < trimmed.length; i++) {
    const c = trimmed[i]

    if (escape) {
      escape = false
      continue
    }
    if (c === '\\' && inString) {
      escape = true
      continue
    }
    if ((c === '"' || c === "'") && !inString) {
      inString = true
      quote = c
      continue
    }
    if (c === quote) {
      inString = false
      quote = null
      continue
    }
    if (inString) continue

    if (c === '{' || c === '[') depth++
    else if (c === '}' || c === ']') {
      depth--
      if (depth === 0) return trimmed.slice(start, i + 1)
    }
  }

  return trimmed.slice(start)
}
