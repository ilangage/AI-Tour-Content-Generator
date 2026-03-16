/**
 * Prompt assembly for regenerating a single tour section.
 * AI returns only the section value as JSON (not the full tour).
 */

import type { Tour } from '@/lib/schema/tour-schema'
import type { RegeneratableTourSection } from '@/lib/types/section'
import { SEO_RULES_PACK, TEMPLATE_SCHEMA } from './prompt-sections'

export interface SectionRegenerationInput {
  section: RegeneratableTourSection
  currentTour: Tour
  sourceItinerary?: string
  keywordSummary?: string
  instruction?: string
}

const SECTION_OUTPUT_FORMAT: Record<RegeneratableTourSection, string> = {
  title: 'Return only a single JSON string: the new tour title. Example: "5-Day Machu Picchu Adventure"',
  description: 'Return only a single JSON string: the new description. Escape newlines as \\n if needed.',
  highlights: 'Return only a JSON array of strings. Example: ["Highlight one", "Highlight two"]. Use 4–6 items.',
  included: 'Return only a JSON array of strings. Example: ["Accommodation", "Meals"].',
  itinerary: 'Return only a JSON array of objects, each with day (number), title (string), activities (array of strings). Example: [{"day":1,"title":"Arrival","activities":["Check-in","Briefing"]}]',
  blogTips: 'Return either a single JSON string or a JSON array of { "title": string, "content": string }. 120–200 words total if string.',
  faqs: 'Return only a JSON array of { "question": string, "answer": string }. Use 4–6 items. Answers 40–80 words each.',
  metaTitle: 'Return only a single JSON string: the meta title, 50–60 characters.',
  metaDescription: 'Return only a single JSON string: the meta description, 150–160 characters.',
}

function buildSystemMessage(section: RegeneratableTourSection): string {
  const outputFormat = SECTION_OUTPUT_FORMAT[section]
  return `You are an expert travel content writer. Your task is to regenerate ONLY ONE section of a tour JSON object.

Rules:
- You will receive the full current tour JSON and the section name to regenerate.
- Stay consistent with the existing tour: same destination, duration, and concept.
- Follow SEO and content rules: natural language, no keyword stuffing, traveler-focused.
- ${SEO_RULES_PACK}

Schema context:
${TEMPLATE_SCHEMA}

Output requirement for this section (${section}):
${outputFormat}

Return ONLY the JSON value for this section. No explanation, no markdown fences, no other text.`
}

function buildUserMessage(input: SectionRegenerationInput): string {
  const { section, currentTour, sourceItinerary, keywordSummary, instruction } = input
  const parts: string[] = [
    `## Section to regenerate: ${section}`,
    '## Current full tour JSON (for context only; do not change other sections):',
    JSON.stringify(currentTour, null, 2),
  ]
  if (keywordSummary?.trim()) {
    parts.push('## Keyword intelligence (use for SEO):', keywordSummary.trim())
  }
  if (sourceItinerary?.trim()) {
    parts.push('## Original itinerary / source (for consistency):', sourceItinerary.trim())
  }
  if (instruction?.trim()) {
    parts.push('## User instruction for this section:', instruction.trim())
  }
  parts.push('', 'Generate the new value for the section only. Output valid JSON only.')
  return parts.join('\n\n')
}

export interface SectionRegenerationPromptPackage {
  systemPrompt: string
  userPrompt: string
}

export function buildSectionRegenerationPrompt(
  input: SectionRegenerationInput
): SectionRegenerationPromptPackage {
  return {
    systemPrompt: buildSystemMessage(input.section),
    userPrompt: buildUserMessage(input),
  }
}
