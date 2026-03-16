import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { TOUR_CONTENT_SYSTEM_PROMPT, TOUR_TEMPLATE_SCHEMA } from '@/lib/tour-ai-prompt'

type KeywordRow = { keyword: string; volume: number; intent: string; priority: string }

export async function POST(req: Request) {
  try {
    const { keywords = [], tourContent = '' } = (await req.json()) as {
      keywords?: KeywordRow[]
      tourContent?: string
    }

    const systemPrompt = `${TOUR_CONTENT_SYSTEM_PROMPT}\n\n${TOUR_TEMPLATE_SCHEMA}`

    const keywordBlock =
      keywords.length > 0
        ? `## Keyword research data (from CSV)\n${JSON.stringify(keywords, null, 2)}`
        : '(No keyword data provided.)'

    const userMessage = `${keywordBlock}\n\n## Raw tour itinerary details\n${tourContent.trim() || '(No itinerary details provided. Generate a sample structure that fits the schema.)'}\n\nGenerate the complete tour JSON now. Output only valid JSON, no other text.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: false,
    })

    const content = completion.choices[0]?.message?.content?.trim() ?? ''
    if (!content) {
      return NextResponse.json(
        { error: 'Empty response from AI' },
        { status: 500 }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Generate tour API error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Tour generation failed',
      },
      { status: 500 }
    )
  }
}
