/**
 * Builds a clean, slugified filename for tour JSON export.
 * Prefers title → destination → generic fallback; optional timestamp to avoid collisions.
 */

import type { Tour } from '@/lib/schema/tour-schema'

const FALLBACK_BASE = 'generated-tour'
const SLUG_MAX_LENGTH = 80

/**
 * Slugify a string for use in filenames: lowercase, replace non-alphanumeric with hyphens, collapse runs, trim.
 */
export function slugifyForFilename(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug.slice(0, SLUG_MAX_LENGTH) || FALLBACK_BASE
}

export interface BuildTourFilenameOptions {
  /** Append a timestamp suffix to avoid overwriting existing files. */
  addTimestamp?: boolean
}

/**
 * Builds a safe filename for exporting a tour as JSON.
 * - Prefers tour.title, then tour.destination, then generic name.
 * - Slugifies the base name and appends .json.
 * - Optional timestamp suffix when addTimestamp is true.
 */
export function buildTourFilename(
  tour: Tour,
  options: BuildTourFilenameOptions = {}
): string {
  const base =
    tour.title?.trim() || tour.destination?.trim() || FALLBACK_BASE
  const slug = slugifyForFilename(base)
  const name = slug || FALLBACK_BASE
  const suffix = options.addTimestamp
    ? `-${Date.now()}`
    : ''
  return `${name}${suffix}.json`
}
