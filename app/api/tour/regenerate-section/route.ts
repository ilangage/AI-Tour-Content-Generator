import { NextResponse } from 'next/server'
import type { RegenerateSectionRequest, RegeneratableTourSection } from '@/lib/types/section'
import type { Tour } from '@/lib/schema/tour-schema'
import { buildSectionRegenerationPrompt } from '@/lib/ai/build-section-regeneration-prompt'
import { sendTourGenerationRequest, hasOpenAiKey } from '@/lib/ai/openai'
import { mergeRegeneratedSection } from '@/lib/tour/merge-regenerated-section'
import { validateTourResponse } from '@/lib/schema/validate-tour'

const ALLOWED_SECTIONS: RegeneratableTourSection[] = [
  'title',
  'description',
  'highlights',
  'included',
  'itinerary',
  'blogTips',
  'faqs',
  'metaTitle',
  'metaDescription',
]

function parseSectionValue(raw: string): unknown {
  const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim()
  return JSON.parse(cleaned)
}

export async function POST(req: Request) {
  try {
    if (!hasOpenAiKey()) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not set.' },
        { status: 503 }
      )
    }

    const body = (await req.json()) as RegenerateSectionRequest
    const { section, currentTour, sourceItinerary, keywordSummary, instruction } = body

    if (!section || !ALLOWED_SECTIONS.includes(section)) {
      return NextResponse.json(
        { error: 'Invalid or missing section name.' },
        { status: 400 }
      )
    }

    const validation = validateTourResponse(currentTour)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Current tour is invalid.', details: validation.errors },
        { status: 400 }
      )
    }

    const tour = validation.data
    const promptPackage = buildSectionRegenerationPrompt({
      section,
      currentTour: tour,
      sourceItinerary,
      keywordSummary,
      instruction,
    })

    const rawContent = await sendTourGenerationRequest(
      [
        { role: 'system', content: promptPackage.systemPrompt },
        { role: 'user', content: promptPackage.userPrompt },
      ],
      { temperature: 0.4, max_tokens: 2048 }
    )

    let sectionValue: unknown
    try {
      sectionValue = parseSectionValue(rawContent)
    } catch {
      return NextResponse.json(
        {
          error: 'Section regeneration did not return valid JSON.',
          rawPreview: rawContent.slice(0, 200),
        },
        { status: 502 }
      )
    }

    const mergeResult = mergeRegeneratedSection(tour, section, sectionValue)
    if (!mergeResult.ok) {
      return NextResponse.json(
        { error: mergeResult.error, details: mergeResult.details },
        { status: 422 }
      )
    }

    return NextResponse.json({ data: mergeResult.tour })
  } catch (err) {
    console.error('Regenerate section error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Section regeneration failed.' },
      { status: 500 }
    )
  }
}
