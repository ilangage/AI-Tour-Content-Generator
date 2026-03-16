/**
 * Final prompt assembly: merges system layers and runtime input into one prompt package.
 * Permanent rules in system prompt; keyword intelligence and itinerary in user prompt.
 */

import type { KeywordIntelligence } from '@/lib/types/keyword'
import {
  MASTER_BOT_PROMPT,
  SEO_RULES_PACK,
  TEMPLATE_LOCK_RULES,
  TEMPLATE_SCHEMA,
  FINAL_OUTPUT_CONTRACT,
} from './prompt-sections'

/** Input for building the tour generation prompt. */
export interface BuildTourPromptInput {
  /** Keyword intelligence summary (from buildKeywordIntelligence). */
  keywordIntelligence: KeywordIntelligence
  /** Raw itinerary details from the user. */
  itineraryText: string
  /** Optional override for template/schema text; uses default if not provided. */
  templateSchemaText?: string
}

/** Assembled prompt package ready for OpenAI. */
export interface BuiltPromptPackage {
  systemPrompt: string
  userPrompt: string
}

const SECTION_SEP = '\n\n'

/**
 * Assemble the system prompt from permanent rules only.
 * Order: master bot → SEO pack → template lock → schema → final output contract.
 */
function assembleSystemPrompt(templateSchemaText: string): string {
  return [
    '[System: Master Bot]',
    MASTER_BOT_PROMPT,
    '[System: SEO Rules]',
    SEO_RULES_PACK,
    '[System: Template Lock]',
    TEMPLATE_LOCK_RULES,
    templateSchemaText,
    '[System: Output Contract]',
    FINAL_OUTPUT_CONTRACT,
  ].join(SECTION_SEP)
}

/**
 * Format keyword intelligence for the user prompt (no raw CSV rows).
 */
function formatKeywordBlock(intel: KeywordIntelligence): string {
  return intel.keywordSummaryText || 'No keyword data provided.'
}

/**
 * Assemble the user prompt from runtime content only: keyword intelligence + itinerary.
 */
function assembleUserPrompt(input: BuildTourPromptInput): string {
  const itineraryBlock =
    input.itineraryText.trim() ||
    '(No itinerary details provided. Generate a sample structure that fits the schema.)'

  const keywordBlock = formatKeywordBlock(input.keywordIntelligence)

  return [
    '[User: Keyword Intelligence]',
    'Use the following for SEO and content angle. Do not stuff keywords.',
    keywordBlock,
    '[User: Raw Tour Itinerary Details]',
    itineraryBlock,
    '[Instruction]',
    'Generate the complete tour JSON now. Output only the single JSON object, nothing else.',
  ].join(SECTION_SEP)
}

/**
 * Build the final prompt package: system prompt (static rules) + user prompt (runtime input).
 */
export function buildTourPrompt(input: BuildTourPromptInput): BuiltPromptPackage {
  const templateSchemaText = input.templateSchemaText?.trim() || TEMPLATE_SCHEMA

  return {
    systemPrompt: assembleSystemPrompt(templateSchemaText),
    userPrompt: assembleUserPrompt(input),
  }
}
