/**
 * Merge a regenerated section back into the current Tour object.
 * Updates only the target section; validates the full result with the locked schema.
 */

import type { Tour } from '@/lib/schema/tour-schema'
import { tourSchema } from '@/lib/schema/tour-schema'
import type { RegeneratableTourSection } from '@/lib/types/section'
import type { ItineraryDay, FaqItem, BlogTip } from '@/lib/schema/tour-schema'

interface BlogTipsObject {
  title: string
  content: string
}

export type MergeResult = { ok: true; tour: Tour } | { ok: false; error: string; details?: unknown }

function normalizeHighlights(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((x) => typeof x === 'string')
  if (typeof value === 'string') return value.split('\n').map((s) => s.trim()).filter(Boolean)
  return []
}

function normalizeIncluded(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((x) => typeof x === 'string')
  if (typeof value === 'string') return value.split('\n').map((s) => s.trim()).filter(Boolean)
  return []
}

function normalizeItinerary(value: unknown): ItineraryDay[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is ItineraryDay => {
    return (
      typeof item === 'object' &&
      item !== null &&
      'day' in item &&
      'title' in item &&
      'activities' in item &&
      Array.isArray((item as ItineraryDay).activities)
    )
  }).map((item) => ({
    day: Number((item as ItineraryDay).day),
    title: String((item as ItineraryDay).title),
    activities: (item as ItineraryDay).activities.map(String),
  }))
}

function normalizeFaqs(value: unknown): FaqItem[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is FaqItem => {
    return (
      typeof item === 'object' &&
      item !== null &&
      'question' in item &&
      'answer' in item
    )
  }).map((item) => ({
    question: String((item as FaqItem).question),
    answer: String((item as FaqItem).answer),
  }))
}

function normalizeBlogTips(value: unknown): BlogTipsObject | undefined {
  if (value === undefined || value === null) return undefined

  // If the model returned a plain string, treat it as content and synthesize a simple title.
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    return { title: 'Travel tips', content: trimmed }
  }

  // If we have an array of tips, pick the first valid one and normalize it.
  if (Array.isArray(value)) {
    const first = value.find((item): item is BlogTip => {
      return (
        typeof item === 'object' &&
        item !== null &&
        'title' in item &&
        'content' in item
      )
    })
    if (!first) return undefined
    return { title: String(first.title), content: String(first.content) }
  }

  // If we have an object with title + content, normalize it.
  if (typeof value === 'object' && value !== null && 'title' in value && 'content' in value) {
    return {
      title: String((value as { title: unknown }).title),
      content: String((value as { content: unknown }).content),
    }
  }

  return undefined
}

/**
 * Merge the regenerated section value into a copy of the tour and validate.
 * Returns { ok: true, tour } or { ok: false, error, details }.
 */
export function mergeRegeneratedSection(
  currentTour: Tour,
  section: RegeneratableTourSection,
  sectionValue: unknown
): MergeResult {
  const next = { ...currentTour }

  switch (section) {
    case 'title':
      if (typeof sectionValue !== 'string') return { ok: false, error: 'Invalid title' }
      next.title = sectionValue
      break
    case 'description':
      if (typeof sectionValue !== 'string') return { ok: false, error: 'Invalid description' }
      next.description = sectionValue
      break
    case 'highlights':
      next.highlights = normalizeHighlights(sectionValue)
      break
    case 'included':
      next.included = normalizeIncluded(sectionValue)
      break
    case 'itinerary':
      next.itinerary = normalizeItinerary(sectionValue)
      break
    case 'blogTips':
      next.blogTips = normalizeBlogTips(sectionValue)
      break
    case 'faqs':
      next.faqs = normalizeFaqs(sectionValue)
      break
    case 'metaTitle':
      if (sectionValue !== undefined && sectionValue !== null) next.metaTitle = String(sectionValue)
      break
    case 'metaDescription':
      if (sectionValue !== undefined && sectionValue !== null) next.metaDescription = String(sectionValue)
      break
    default:
      return { ok: false, error: `Unknown section: ${section}` }
  }

  const parsed = tourSchema.safeParse(next)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Merged tour failed schema validation.',
      details: parsed.error.issues,
    }
  }

  return { ok: true, tour: parsed.data }
}
