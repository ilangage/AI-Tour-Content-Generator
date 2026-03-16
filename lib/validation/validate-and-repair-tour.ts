/**
 * Orchestrates sanitize → parse → validate → repair (if needed) → reparse → revalidate.
 * Returns a single structured result; never returns raw broken output as valid.
 */

import type { Tour } from '@/lib/schema/tour-schema'
import { validateTourResponse } from '@/lib/schema/validate-tour'
import { sanitizeAiOutput } from './sanitize-ai-output'
import { safeParseJson } from './safe-parse-json'
import { repairJsonText } from './repair-json-text'

export type TourGenerationResult =
  | {
      ok: true
      data: Tour
      repaired?: boolean
      warnings?: string[]
    }
  | {
      ok: false
      stage: 'sanitize' | 'parse' | 'validate' | 'repair'
      message: string
      details?: unknown
      rawPreview?: string
    }

const RAW_PREVIEW_LENGTH = 200

function takePreview(raw: string): string {
  return raw.length <= RAW_PREVIEW_LENGTH ? raw : raw.slice(0, RAW_PREVIEW_LENGTH) + '…'
}

/**
 * Run the full pipeline: sanitize, parse, validate; on failure attempt repair then reparse and revalidate.
 * Does not fabricate data; fails safely if output still does not match the Tour schema.
 */
export function validateAndRepairTourOutput(rawModelOutput: string): TourGenerationResult {
  const { sanitized, original } = sanitizeAiOutput(rawModelOutput)

  if (!sanitized) {
    return {
      ok: false,
      stage: 'sanitize',
      message: 'Model output was empty after sanitization.',
      rawPreview: takePreview(original),
    }
  }

  let parseResult = safeParseJson(sanitized)
  let textUsed = sanitized
  let repaired = false
  const warnings: string[] = []

  if (!parseResult.ok) {
    const repairedText = repairJsonText(sanitized, true)
    if (repairedText === sanitized) {
      return {
        ok: false,
        stage: 'parse',
        message: parseResult.error,
        details: { parseError: parseResult.error },
        rawPreview: takePreview(original),
      }
    }
    textUsed = repairedText
    repaired = true
    warnings.push('JSON parse failed; applied conservative repair and retried.')
    parseResult = safeParseJson(repairedText)

    if (!parseResult.ok) {
      return {
        ok: false,
        stage: 'repair',
        message: 'Repair did not produce valid JSON.',
        details: { parseError: parseResult.error },
        rawPreview: takePreview(original),
      }
    }
  }

  let validation = validateTourResponse(parseResult.data)

  if (!validation.valid) {
    const repairedText = repairJsonText(textUsed, true)
    const wasRepaired = repairedText !== textUsed
    if (wasRepaired) {
      repaired = true
      warnings.push('Schema validation failed; applied repair and revalidated.')
      const secondParse = safeParseJson(repairedText)
      if (secondParse.ok) {
        validation = validateTourResponse(secondParse.data)
      }
    }

    if (!validation.valid) {
      return {
        ok: false,
        stage: 'validate',
        message: 'Output does not match the locked Tour schema.',
        details: { validationErrors: validation.errors },
        rawPreview: takePreview(original),
      }
    }
  }

  return {
    ok: true,
    data: validation.data,
    ...(repaired && { repaired: true }),
    ...(warnings.length > 0 && { warnings }),
  }
}
