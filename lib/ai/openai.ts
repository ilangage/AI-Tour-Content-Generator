/**
 * OpenAI service for tour content generation.
 * Initialized from OPENAI_API_KEY; provides a single generation function.
 */

import OpenAI from 'openai'

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

function getApiKey(): string {
  const key = process.env.OPENAI_API_KEY ?? process.env.openai_api_key
  if (!key || typeof key !== 'string' || !key.trim()) {
    throw new Error('OPENAI_API_KEY is not set. Add it to .env.local.')
  }
  return key.trim()
}

let clientInstance: OpenAI | null = null

function getClient(): OpenAI {
  if (!clientInstance) {
    clientInstance = new OpenAI({ apiKey: getApiKey() })
  }
  return clientInstance
}

export interface TourGenerationOptions {
  temperature?: number
  max_tokens?: number
}

/**
 * Send a generation request and return the assistant message content.
 * Expects JSON output from the model; caller is responsible for parsing.
 */
export async function sendTourGenerationRequest(
  messages: ChatMessage[],
  options?: TourGenerationOptions
): Promise<string> {
  const client = getClient()
  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    stream: false,
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.max_tokens ?? 4096,
  })

  const content = completion.choices[0]?.message?.content
  if (content == null || typeof content !== 'string') {
    throw new Error('OpenAI returned no content.')
  }
  return content.trim()
}

/**
 * Check whether the API key is configured (for validation before running).
 */
export function hasOpenAiKey(): boolean {
  try {
    getApiKey()
    return true
  } catch {
    return false
  }
}
