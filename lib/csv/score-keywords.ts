/**
 * Keyword scoring and selection: primary (1), secondary (3–6), semantic (4–8).
 * Weighted by priority, volume, intent fit, difficulty, destination relevance.
 */

import type { NormalizedKeyword } from '@/lib/types/keyword'

const PRIORITY_WEIGHT: Record<string, number> = {
  high: 1,
  h: 1,
  medium: 0.6,
  med: 0.6,
  m: 0.6,
  low: 0.3,
  l: 0.3,
}

const INTENT_WEIGHT: Record<string, number> = {
  informational: 1,
  information: 1,
  commercial: 0.85,
  transactional: 0.7,
  navigational: 0.6,
}

const SECONDARY_COUNT_MIN = 3
const SECONDARY_COUNT_MAX = 6
const SEMANTIC_COUNT_MIN = 4
const SEMANTIC_COUNT_MAX = 8

function getPriorityScore(priority: string): number {
  if (!priority) return 0.5
  const key = priority.trim().toLowerCase()
  return PRIORITY_WEIGHT[key] ?? 0.5
}

function getIntentScore(intent: string): number {
  if (!intent) return 0.7
  const key = intent.trim().toLowerCase()
  return INTENT_WEIGHT[key] ?? 0.7
}

/** Lower difficulty = higher score (easier to rank). 0–100 scale assumed. */
function getDifficultyScore(difficulty: number): number {
  if (difficulty <= 0) return 1
  if (difficulty >= 100) return 0.2
  return 1 - difficulty / 100
}

/** Normalize volume to 0–1 given max volume in the set. */
function normalizeVolume(volume: number, maxVolume: number): number {
  if (maxVolume <= 0) return volume > 0 ? 1 : 0.5
  return Math.min(1, volume / maxVolume) || 0
}

export interface ScoredKeyword extends NormalizedKeyword {
  score: number
}

const WEIGHT_PRIORITY = 0.25
const WEIGHT_VOLUME = 0.3
const WEIGHT_INTENT = 0.2
const WEIGHT_DIFFICULTY = 0.15
const WEIGHT_DESTINATION = 0.1

/**
 * Score and rank keywords. Drops very low-quality rows (no keyword value).
 */
export function scoreKeywords(keywords: NormalizedKeyword[]): ScoredKeyword[] {
  if (keywords.length === 0) return []

  const maxVolume = Math.max(1, ...keywords.map((k) => k.volume))
  const hasAnyDestination = keywords.some((k) => k.destination.length > 0)

  const scored: ScoredKeyword[] = keywords.map((kw) => {
    const priorityScore = getPriorityScore(kw.priority)
    const volumeScore = normalizeVolume(kw.volume, maxVolume)
    const intentScore = getIntentScore(kw.intent)
    const difficultyScore = getDifficultyScore(kw.difficulty)
    const destinationScore = hasAnyDestination && kw.destination.length > 0 ? 1 : 0.5

    const score =
      WEIGHT_PRIORITY * priorityScore +
      WEIGHT_VOLUME * volumeScore +
      WEIGHT_INTENT * intentScore +
      WEIGHT_DIFFICULTY * difficultyScore +
      WEIGHT_DESTINATION * destinationScore

    return { ...kw, score }
  })

  return scored.sort((a, b) => b.score - a.score)
}

/**
 * Select one primary, 3–6 secondary, 4–8 semantic keywords from scored list.
 * Ignores low-quality: very low score and no volume/priority.
 */
export function selectKeywordSets(
  scored: ScoredKeyword[]
): { primary: ScoredKeyword | null; secondary: ScoredKeyword[]; semantic: ScoredKeyword[] } {
  const minScore = 0.15
  const filtered = scored.filter(
    (k) => k.score >= minScore || k.volume > 0 || (k.priority && k.priority.length > 0)
  )

  if (filtered.length === 0) {
    return { primary: null, secondary: [], semantic: [] }
  }

  const primary = filtered[0] ?? null
  const secondaryCount = Math.min(
    Math.max(SECONDARY_COUNT_MIN, Math.min(SECONDARY_COUNT_MAX, filtered.length - 1)),
    Math.max(0, filtered.length - 1)
  )
  const secondary = filtered.slice(1, 1 + secondaryCount)

  const afterSecondary = 1 + secondaryCount
  const semanticCount = Math.min(
    SEMANTIC_COUNT_MAX,
    Math.max(SEMANTIC_COUNT_MIN, filtered.length - afterSecondary),
    Math.max(0, filtered.length - afterSecondary)
  )
  const semantic = filtered.slice(afterSecondary, afterSecondary + semanticCount)

  return { primary, secondary, semantic }
}
