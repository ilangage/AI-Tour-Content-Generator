/**
 * Build keyword intelligence from CSV or normalized keywords.
 * One primary, 3–6 secondary, 4–8 semantic; searchIntent, contentAngle, keywordSummaryText.
 */

import type { KeywordIntelligence, NormalizedKeyword } from '@/lib/types/keyword'
import { normalizeKeywordsFromCsv } from './normalize-keywords'
import { scoreKeywords, selectKeywordSets } from './score-keywords'

function deriveSearchIntent(
  primary: { intent: string } | null,
  secondary: Array<{ intent: string }>
): string {
  const intents = [
    ...(primary?.intent ? [primary.intent] : []),
    ...secondary.map((k) => k.intent).filter(Boolean),
  ]
  if (intents.length === 0) return 'informational'
  const lower = intents.map((i) => i.trim().toLowerCase())
  const counts: Record<string, number> = {}
  for (const i of lower) {
    counts[i] = (counts[i] ?? 0) + 1
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] ?? 'informational'
}

function deriveContentAngle(primaryKeyword: string, secondaryKeywords: string[]): string {
  if (!primaryKeyword) return 'Travel and tour experience.'
  const theme = primaryKeyword
  const support = secondaryKeywords.slice(0, 3).join(', ')
  if (!support) return `Focus on: ${theme}.`
  return `Primary focus: ${theme}. Supporting themes: ${support}.`
}

function buildKeywordSummaryText(intel: {
  primaryKeyword: string
  secondaryKeywords: string[]
  semanticKeywords: string[]
  searchIntent: string
  contentAngle: string
}): string {
  const lines: string[] = [
    `Primary keyword: ${intel.primaryKeyword || 'None'}`,
    `Secondary keywords (${intel.secondaryKeywords.length}): ${intel.secondaryKeywords.join(', ') || 'None'}`,
    `Semantic keywords (${intel.semanticKeywords.length}): ${intel.semanticKeywords.join(', ') || 'None'}`,
    `Search intent: ${intel.searchIntent}`,
    `Content angle: ${intel.contentAngle}`,
  ]
  return lines.filter(Boolean).join('\n')
}

/**
 * Build keyword intelligence from normalized keyword list.
 */
export function buildKeywordIntelligenceFromNormalized(
  keywords: NormalizedKeyword[]
): KeywordIntelligence {
  if (keywords.length === 0) {
    return {
      primaryKeyword: '',
      secondaryKeywords: [],
      semanticKeywords: [],
      searchIntent: 'informational',
      contentAngle: 'Travel and tour experience.',
      keywordSummaryText: 'No keyword data provided.',
    }
  }

  const scored = scoreKeywords(keywords)
  const { primary, secondary, semantic } = selectKeywordSets(scored)

  const primaryKeyword = primary?.keyword ?? ''
  const secondaryKeywords = secondary.map((k) => k.keyword)
  const semanticKeywords = semantic.map((k) => k.keyword)

  const searchIntent = deriveSearchIntent(primary, secondary)
  const contentAngle = deriveContentAngle(primaryKeyword, secondaryKeywords)

  const keywordSummaryText = buildKeywordSummaryText({
    primaryKeyword,
    secondaryKeywords,
    semanticKeywords,
    searchIntent,
    contentAngle,
  })

  return {
    primaryKeyword,
    secondaryKeywords,
    semanticKeywords,
    searchIntent,
    contentAngle,
    keywordSummaryText,
  }
}

/**
 * Build keyword intelligence from raw CSV text.
 * Parses, normalizes, scores, and returns the intelligence object.
 */
export function buildKeywordIntelligence(csvText: string): KeywordIntelligence {
  const normalized = normalizeKeywordsFromCsv(csvText)
  return buildKeywordIntelligenceFromNormalized(normalized)
}

/**
 * Apply a manual primary keyword override on top of existing intelligence.
 * Keeps secondary/semantic lists, but removes duplicates and refreshes angle + summary.
 */
export function overrideKeywordIntelligencePrimary(
  intel: KeywordIntelligence,
  primaryOverride: string
): KeywordIntelligence {
  const trimmed = primaryOverride.trim()
  if (!trimmed) return intel

  const normalizedOverride = trimmed.toLowerCase()
  const secondaryKeywords = intel.secondaryKeywords.filter(
    (k) => k.toLowerCase() !== normalizedOverride
  )

  const contentAngle = deriveContentAngle(trimmed, secondaryKeywords)
  const keywordSummaryText = buildKeywordSummaryText({
    primaryKeyword: trimmed,
    secondaryKeywords,
    semanticKeywords: intel.semanticKeywords,
    searchIntent: intel.searchIntent,
    contentAngle,
  })

  return {
    ...intel,
    primaryKeyword: trimmed,
    secondaryKeywords,
    contentAngle,
    keywordSummaryText,
  }
}
