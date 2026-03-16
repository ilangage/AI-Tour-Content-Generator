import { NextResponse } from 'next/server'
import { getDraft, updateDraft, deleteDraft } from '@/lib/storage/tour-drafts'
import type { SavedTourDraft } from '@/lib/types/draft'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const draft = await getDraft(id)
    if (!draft) {
      return NextResponse.json({ error: 'Draft not found.' }, { status: 404 })
    }
    return NextResponse.json(draft)
  } catch (err) {
    console.error('Draft get error:', err)
    return NextResponse.json(
      { error: 'Failed to load draft.' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json() as Partial<SavedTourDraft>
    const { title, destination, data, repaired, warnings, sourceItinerary, keywordSummary } = body

    const updated = await updateDraft(id, {
      ...(title !== undefined && { title }),
      ...(destination !== undefined && { destination }),
      ...(data !== undefined && { data }),
      ...(repaired !== undefined && { repaired }),
      ...(warnings !== undefined && { warnings }),
      ...(sourceItinerary !== undefined && { sourceItinerary }),
      ...(keywordSummary !== undefined && { keywordSummary }),
    })

    if (!updated) {
      return NextResponse.json({ error: 'Draft not found.' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (err) {
    console.error('Draft update error:', err)
    return NextResponse.json(
      { error: 'Failed to update draft.' },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const ok = await deleteDraft(id)
    if (!ok) {
      return NextResponse.json({ error: 'Draft not found.' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Draft delete error:', err)
    return NextResponse.json(
      { error: 'Failed to delete draft.' },
      { status: 500 }
    )
  }
}
