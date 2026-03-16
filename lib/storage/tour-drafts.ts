/**
 * File-based persistence for tour drafts.
 * One JSON file per draft in data/tour-drafts/ for easy inspection and extension.
 */

import type { SavedTourDraft } from '@/lib/types/draft'
import type { Tour } from '@/lib/schema/tour-schema'
import { readFile, writeFile, readdir, unlink, mkdir } from 'fs/promises'
import { join } from 'path'

export type { SavedTourDraft }

const DRAFTS_DIR = join(process.cwd(), 'data', 'tour-drafts')
const EXT = '.json'

function draftPath(id: string): string {
  return join(DRAFTS_DIR, `${id}${EXT}`)
}

async function ensureDir(): Promise<void> {
  try {
    await mkdir(DRAFTS_DIR, { recursive: true })
  } catch {
    // already exists or permission error
  }
}

export async function listDrafts(): Promise<SavedTourDraft[]> {
  await ensureDir()
  let entries: string[] = []
  try {
    entries = await readdir(DRAFTS_DIR)
  } catch {
    return []
  }

  const drafts: SavedTourDraft[] = []
  for (const name of entries) {
    if (!name.endsWith(EXT)) continue
    const id = name.slice(0, -EXT.length)
    try {
      const draft = await getDraft(id)
      if (draft) drafts.push(draft)
    } catch {
      // skip corrupted files
    }
  }

  drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  return drafts
}

export async function getDraft(id: string): Promise<SavedTourDraft | null> {
  await ensureDir()
  const path = draftPath(id)
  try {
    const raw = await readFile(path, 'utf-8')
    const draft = JSON.parse(raw) as SavedTourDraft
    if (!draft.id || !draft.data) return null
    return draft
  } catch {
    return null
  }
}

export async function createDraft(
  input: Omit<SavedTourDraft, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<SavedTourDraft> {
  await ensureDir()
  const id = input.id ?? crypto.randomUUID()
  const now = new Date().toISOString()
  const draft: SavedTourDraft = {
    ...input,
    id,
    createdAt: now,
    updatedAt: now,
  }
  const path = draftPath(id)
  await writeFile(path, JSON.stringify(draft, null, 2), 'utf-8')
  return draft
}

export async function updateDraft(
  id: string,
  input: Partial<Omit<SavedTourDraft, 'id' | 'createdAt'>> & { updatedAt?: string }
): Promise<SavedTourDraft | null> {
  const existing = await getDraft(id)
  if (!existing) return null

  const updatedAt = new Date().toISOString()
  const draft: SavedTourDraft = {
    ...existing,
    ...input,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt,
  }
  const path = draftPath(id)
  await writeFile(path, JSON.stringify(draft, null, 2), 'utf-8')
  return draft
}

export async function deleteDraft(id: string): Promise<boolean> {
  const path = draftPath(id)
  try {
    await unlink(path)
    return true
  } catch {
    return false
  }
}
