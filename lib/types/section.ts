import type { Tour } from '@/lib/schema/tour-schema'

export type RegeneratableTourSection =
  | 'title'
  | 'description'
  | 'highlights'
  | 'included'
  | 'itinerary'
  | 'blogTips'
  | 'faqs'
  | 'metaTitle'
  | 'metaDescription'

export interface RegenerateSectionRequest {
  section: RegeneratableTourSection
  currentTour: Tour
  sourceItinerary?: string
  keywordSummary?: string
  instruction?: string
}

/** Section value as returned by AI (JSON parseable). */
export type SectionValue = string | string[] | Tour['itinerary'] | Tour['faqs'] | Tour['blogTips']
