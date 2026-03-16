/**
 * Validates AI-generated tour JSON against the locked Tour schema.
 * Returns structured result for API and UI.
 */

import { tourSchema, type Tour } from './tour-schema'

export type ValidationError = {
  path: string
  message: string
}

export type TourValidationResult =
  | { valid: true; data: Tour }
  | { valid: false; errors: ValidationError[] }

/**
 * Validate unknown payload against the Tour schema.
 * Rejects extra fields, missing required fields, and wrong types.
 */
export function validateTourResponse(payload: unknown): TourValidationResult {
  const result = tourSchema.safeParse(payload)

  if (result.success) {
    return { valid: true, data: result.data }
  }

  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join('.') : 'root',
    message: issue.message,
  }))

  return { valid: false, errors }
}
