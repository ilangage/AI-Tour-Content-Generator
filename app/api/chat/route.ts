import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      stream: false,
    })
    return NextResponse.json(stream.choices[0]?.message ?? {})
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'OpenAI request failed' },
      { status: 500 }
    )
  }
}
