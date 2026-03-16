/**
 * Types for keyword CSV processing and keyword intelligence output.
 */

/** Raw row as parsed from CSV (string values, any column names). */
export type RawKeywordRow = Record<string, string>

/** Normalized keyword row with canonical fields and types. */
export interface NormalizedKeyword {
  keyword: string
  volume: number
  intent: string
  priority: string
  difficulty: number
  destination: string
  notes: string
}

/** Final keyword intelligence object for AI prompt injection. */
export interface KeywordIntelligence {
  primaryKeyword: string
  secondaryKeywords: string[]
  semanticKeywords: string[]
  searchIntent: string
  contentAngle: string
  keywordSummaryText: string
}
