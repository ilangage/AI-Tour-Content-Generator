/**
 * Export utilities for tour JSON: pretty format, validation guard, download and copy.
 * Browser-safe; only call from client components.
 */

import { validateTourResponse } from '@/lib/schema/validate-tour'
import type { Tour } from '@/lib/schema/tour-schema'
import { buildTourFilename } from './build-tour-filename'

const EXPORT_INVALID_MESSAGE = 'No valid JSON to export'

/** Pretty-format tour as JSON string (no markdown or wrapper). */
export function formatTourForExport(tour: Tour): string {
  return JSON.stringify(tour, null, 2)
}

export type DownloadResult =
  | { success: true }
  | { success: false; message: string }

export type CopyResult =
  | { success: true }
  | { success: false; message: string }

export interface DownloadTourJsonOptions {
  /** Override auto-generated filename. */
  filename?: string
  /** Add timestamp suffix to avoid overwriting. */
  addTimestamp?: boolean
}

/**
 * Validates the current tour, then triggers a browser download of pretty JSON.
 * Only exports when the payload passes schema validation.
 */
export function downloadTourJson(
  tour: Tour | null,
  options: DownloadTourJsonOptions = {}
): DownloadResult {
  if (tour == null) {
    return { success: false, message: EXPORT_INVALID_MESSAGE }
  }

  const validated = validateTourResponse(tour)
  if (!validated.valid) {
    return { success: false, message: EXPORT_INVALID_MESSAGE }
  }

  const json = formatTourForExport(validated.data)
  const filename =
    options.filename ??
    buildTourFilename(validated.data, { addTimestamp: options.addTimestamp })
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  try {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    return { success: true }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Validates the current tour, then copies pretty JSON to the clipboard.
 * Only copies when the payload passes schema validation.
 */
export async function copyTourJsonToClipboard(tour: Tour | null): Promise<CopyResult> {
  if (tour == null) {
    return { success: false, message: EXPORT_INVALID_MESSAGE }
  }

  const validated = validateTourResponse(tour)
  if (!validated.valid) {
    return { success: false, message: EXPORT_INVALID_MESSAGE }
  }

  const json = formatTourForExport(validated.data)

  try {
    await navigator.clipboard.writeText(json)
    return { success: true }
  } catch {
    return { success: false, message: 'Copy failed' }
  }
}

/**
 * Lightweight check: is the current value present and valid enough to export?
 * Use to enable/disable Copy and Download without running full export.
 */
export function canExportTour(tour: Tour | null): boolean {
  if (tour == null) return false
  const result = validateTourResponse(tour)
  return result.valid
}
