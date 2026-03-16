import type { Tour } from '@/lib/schema/tour-schema'

export interface SavedTourDraft {
  id: string
  createdAt: string
  updatedAt: string
  title?: string
  destination?: string
  data: Tour
  repaired?: boolean
  warnings?: string[]
  sourceItinerary?: string
  keywordSummary?: string
}
