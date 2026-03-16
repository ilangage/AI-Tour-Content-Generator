import { NextResponse } from 'next/server'
import { listDrafts, createDraft } from '@/lib/storage/tour-drafts'
import type { SavedTourDraft } from '@/lib/types/draft'

export async function GET() {
  try {
    const drafts = await listDrafts()
    return NextResponse.json(drafts)
  } catch (err) {
    console.error('Drafts list error:', err)
    return NextResponse.json(
      { error: 'Failed to list drafts.' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      title,
      destination,
      data,
      repaired,
      warnings,
      sourceItinerary,
      keywordSummary,
      id,
    } = body as Partial<SavedTourDraft> & { data: SavedTourDraft['data'] }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid draft data.' },
        { status: 400 }
      )
    }

    const draft = await createDraft({
      title,
      destination,
      data,
      repaired,
      warnings,
      sourceItinerary,
      keywordSummary,
      ...(id && { id }),
    })

    return NextResponse.json(draft)
  } catch (err) {
    console.error('Draft create error:', err)
    return NextResponse.json(
      { error: 'Failed to save draft.' },
      { status: 500 }
    )
  }
}
