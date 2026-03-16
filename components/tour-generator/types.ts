/**
 * UI state and API response types for the tour generator workspace.
 */

import type { Tour } from '@/lib/schema/tour-schema'

export type PreviewTabId = 'preview' | 'raw-json' | 'validation'

export interface GenerationUiState {
  isLoading: boolean
  error: string | null
  result: Tour | null
  repaired: boolean
  warnings: string[]
  activeTab: PreviewTabId
  /** Validation errors from API when stage is validate. */
  validationErrors: Array<{ path: string; message: string }> | null
}

export interface ApiSuccessResponse {
  data: Tour
  repaired?: boolean
  warnings?: string[]
}

export interface ApiErrorResponse {
  error: string
  details?: { validationErrors?: Array<{ path: string; message: string }> }
  rawPreview?: string
}

export type { Tour }
