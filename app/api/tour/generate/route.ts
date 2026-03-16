/**
 * Tour content generation API.
 * Accepts CSV file + itinerary text, calls OpenAI, returns structured JSON.
 */

import { NextResponse } from 'next/server'
import { buildKeywordIntelligence } from '@/lib/csv/build-keyword-intelligence'
import { buildTourPrompt } from '@/lib/ai/build-tour-prompt'
import { generateTourJson } from '@/lib/ai/generate-tour-json'
import { hasOpenAiKey } from '@/lib/ai/openai'
import { validateAndRepairTourOutput } from '@/lib/validation/validate-and-repair-tour'

const FORM_FIELD_CSV = 'csv'
const FORM_FIELD_ITINERARY = 'itinerary'

export async function POST(req: Request) {
  try {
    if (!hasOpenAiKey()) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not set. Add it to .env.local.' },
        { status: 503 }
      )
    }

    const formData = await req.formData()
    const csvFile = formData.get(FORM_FIELD_CSV)
    const itineraryRaw = formData.get(FORM_FIELD_ITINERARY)

    if (!csvFile || !(csvFile instanceof File)) {
      return NextResponse.json(
        { error: 'CSV file is required. Upload a keyword research CSV.' },
        { status: 400 }
      )
    }

    const itineraryText =
      typeof itineraryRaw === 'string'
        ? itineraryRaw
        : itineraryRaw instanceof File
          ? await itineraryRaw.text()
          : ''
    const itineraryTrimmed = itineraryText.trim()
    if (!itineraryTrimmed) {
      return NextResponse.json(
        { error: 'Itinerary text is required. Enter raw tour itinerary details.' },
        { status: 400 }
      )
    }

    const csvText = await csvFile.text()
    const keywordIntelligence = buildKeywordIntelligence(csvText)
    if (!keywordIntelligence.primaryKeyword && keywordIntelligence.secondaryKeywords.length === 0) {
      return NextResponse.json(
        { error: 'CSV could not be parsed or contains no valid keyword rows.' },
        { status: 400 }
      )
    }

    const promptPackage = buildTourPrompt({
      keywordIntelligence,
      itineraryText: itineraryTrimmed,
    })

    const rawContent = await generateTourJson(promptPackage)

    const result = validateAndRepairTourOutput(rawContent)

    if (!result.ok) {
      const status = result.stage === 'validate' ? 422 : 502
      const errorBody: Record<string, unknown> = {
        error: result.message,
      }
      if (result.details) errorBody.details = result.details
      if (result.rawPreview) errorBody.rawPreview = result.rawPreview

      return NextResponse.json(errorBody, { status })
    }

    const body: Record<string, unknown> = { data: result.data }
    if (result.repaired) body.repaired = true
    if (result.warnings && result.warnings.length > 0) body.warnings = result.warnings

    return NextResponse.json(body)
  } catch (err) {
    console.error('Tour generate error:', err)
    const message =
      err instanceof Error ? err.message : 'Tour generation failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
