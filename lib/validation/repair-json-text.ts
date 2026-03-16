/**
 * Lightweight, conservative repairs for JSON text only.
 * No fabricating missing fields or inventing business data.
 */

import { isolateJsonObject } from './sanitize-ai-output'

const MARKDOWN_FENCE = /^```(?:json)?\s*\n?|\n?```\s*$/g

/** Replace smart/curly quotes with normal ASCII quotes. */
function replaceSmartQuotes(text: string): string {
  return text
    .replace(/\u201C/g, '"')  // "
    .replace(/\u201D/g, '"')  // "
    .replace(/\u2018/g, "'")  // '
    .replace(/\u2019/g, "'")  // '
}

/** Remove trailing commas immediately before } or ]. */
function removeTrailingCommas(text: string): string {
  return text.replace(/,(\s*[}\]])/g, '$1')
}

/** Normalize line endings to \n. */
function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

/**
 * Apply allowed repairs only: smart quotes, fences, trailing commas, line endings.
 * Optionally extract the most likely top-level JSON object block.
 * Does not add or invent any fields or data.
 */
export function repairJsonText(text: string, extractBlock: boolean = true): string {
  let out = text.trim()

  out = normalizeLineEndings(out)
  out = out.replace(MARKDOWN_FENCE, '').trim()
  out = replaceSmartQuotes(out)
  out = removeTrailingCommas(out)

  if (extractBlock && (out.includes('{') || out.includes('['))) {
    out = isolateJsonObject(out)
  }

  return out.trim()
}
