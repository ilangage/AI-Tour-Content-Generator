/**
 * Tour JSON generation: takes assembled prompt package, calls OpenAI, returns raw response text.
 */

import type { BuiltPromptPackage } from './build-tour-prompt'
import { sendTourGenerationRequest } from './openai'

/** Stable generation settings for consistent JSON output. */
const GENERATION_OPTIONS = {
  temperature: 0.3,
  max_tokens: 4096,
} as const

/**
 * Call OpenAI with one system message and one user message from the prompt package.
 * Returns the raw model response text (caller parses and validates JSON).
 */
export async function generateTourJson(
  promptPackage: BuiltPromptPackage
): Promise<string> {
  const messages = [
    { role: 'system' as const, content: promptPackage.systemPrompt },
    { role: 'user' as const, content: promptPackage.userPrompt },
  ]

  return sendTourGenerationRequest(messages, GENERATION_OPTIONS)
}
