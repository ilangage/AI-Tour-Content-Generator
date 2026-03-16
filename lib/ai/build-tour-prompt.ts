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

export interface MetaSeoOptions {
  metaTitleLength?: number
  metaDescriptionLength?: number
  tone?: 'balanced' | 'aggressive' | 'soft' | 'luxury'
}

export type TourTypePreset = 'day' | 'multi-day' | 'honeymoon' | 'adventure' | 'cultural'

/** Input for building the tour generation prompt. */
export interface BuildTourPromptInput {
  /** Keyword intelligence summary (from buildKeywordIntelligence). */
  keywordIntelligence: KeywordIntelligence
  /** Raw itinerary details from the user. */
  itineraryText: string
  /** Optional high-level tour type preset. */
  tourType?: TourTypePreset
  /** Optional meta SEO controls. */
  metaSeoOptions?: MetaSeoOptions
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

function formatMetaSeoBlock(options?: MetaSeoOptions): string | null {
  if (!options) return null
  const lines: string[] = []
  if (options.metaTitleLength) {
    lines.push(`Target meta title length: ~${options.metaTitleLength} characters.`)
  }
  if (options.metaDescriptionLength) {
    lines.push(`Target meta description length: ~${options.metaDescriptionLength} characters.`)
  }
  if (options.tone) {
    lines.push(`Preferred meta tone: ${options.tone}.`)
  }
  if (lines.length === 0) return null
  lines.push(
    'Optimize metaTitle and metaDescription for click-through rate without keyword stuffing.'
  )
  return lines.join('\n')
}

function formatTourTypeBlock(tourType?: TourTypePreset): string | null {
  if (!tourType) return null
  switch (tourType) {
    case 'day':
      return [
        'Tour type: single day tour.',
        'Structure the itinerary as a one-day schedule with clear time blocks, inclusions/exclusions, and a concise highlight list.',
      ].join('\n')
    case 'multi-day':
      return [
        'Tour type: multi-day package.',
        'Emphasize day-by-day progression, overnight stays, and a stronger narrative across days.',
      ].join('\n')
    case 'honeymoon':
      return [
        'Tour type: honeymoon / couples.',
        'Tone should be romantic and aspirational. Highlight privacy, special experiences, photo spots, and upgrades.',
      ].join('\n')
    case 'adventure':
      return [
        'Tour type: adventure / active.',
        'Tone should be energetic. Highlight activities, difficulty levels, safety notes, and gear recommendations.',
      ].join('\n')
    case 'cultural':
      return [
        'Tour type: cultural / heritage.',
        'Emphasize history, local experiences, guides, and meaningful cultural encounters.',
      ].join('\n')
    default:
      return null
  }
}

/**
 * Assemble the user prompt from runtime content only: keyword intelligence + itinerary.
 */
function assembleUserPrompt(input: BuildTourPromptInput): string {
  const itineraryBlock =
    input.itineraryText.trim() ||
    '(No itinerary details provided. Generate a sample structure that fits the schema.)'

  const keywordBlock = formatKeywordBlock(input.keywordIntelligence)
  const metaSeoBlock = formatMetaSeoBlock(input.metaSeoOptions)
  const tourTypeBlock = formatTourTypeBlock(input.tourType)

  const sections: string[] = [
    '[User: Keyword Intelligence]',
    'Use the following for SEO and content angle. Do not stuff keywords.',
    keywordBlock,
  ]

  if (metaSeoBlock) {
    sections.push('[User: Meta SEO Preferences]', metaSeoBlock)
  }

  if (tourTypeBlock) {
    sections.push('[User: Tour Type Preset]', tourTypeBlock)
  }

  sections.push(
    '[User: thingsToDo and blogTips Requirements]',
    'thingsToDo and blogTips are MANDATORY fields in the final Tour JSON. They must be generated from the filtered best keywords from the CSV keyword intelligence and must match the real destination, itinerary, highlights, and included experiences.',
    'If either section is missing, generic, empty, malformed, or misaligned with the destination and itinerary, silently correct ONLY those sections before returning the final JSON. Never return empty arrays, empty strings, plain strings, or placeholder/generic filler for these fields.'
  )

  sections.push(
    '[User: Raw Tour Itinerary Details]',
    itineraryBlock,
    '[Instruction]',
    'Generate the complete tour JSON now. Output only the single JSON object, nothing else.'
  )

  return sections.join(SECTION_SEP)
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
