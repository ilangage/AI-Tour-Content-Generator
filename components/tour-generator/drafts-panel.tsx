'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FolderOpen, Copy, Trash2, Wrench, Loader2 } from 'lucide-react'
import type { SavedTourDraft } from '@/lib/types/draft'
import { cn } from '@/lib/utils'

const DRAFTS_API = '/api/tour/drafts'

interface DraftsPanelProps {
  onOpenDraft: (draft: SavedTourDraft) => void
  onDuplicateDraft: (draft: SavedTourDraft) => void
  onDraftDeleted?: (deletedId: string) => void
  refreshTrigger?: number
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function DraftsPanel({
  onOpenDraft,
  onDuplicateDraft,
  onDraftDeleted,
  refreshTrigger = 0,
}: DraftsPanelProps) {
  const [drafts, setDrafts] = useState<SavedTourDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchDrafts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(DRAFTS_API)
      if (res.ok) {
        const list = await res.json()
        setDrafts(list)
      }
    } catch {
      setDrafts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDrafts()
  }, [fetchDrafts, refreshTrigger])

  const handleDelete = useCallback(async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`${DRAFTS_API}/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        const id = deleteId
        setDrafts((prev) => prev.filter((d) => d.id !== id))
        setDeleteId(null)
        onDraftDeleted?.(id)
      }
    } finally {
      setDeleting(false)
    }
  }, [deleteId, onDraftDeleted])

  return (
    <>
      <Card className="rounded-xl border border-border bg-card shadow-sm flex flex-col min-h-0">
        <CardHeader className="pb-2 shrink-0">
          <h2 className="text-sm font-medium text-foreground">Saved drafts</h2>
          <p className="text-xs text-muted-foreground">
            Open, duplicate, or delete saved tour JSON.
          </p>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : drafts.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No drafts yet. Generate and save to see them here.
            </div>
          ) : (
            <ScrollArea className="h-[280px] w-full pr-2">
              <ul className="space-y-2">
                {drafts.map((draft) => (
                  <li
                    key={draft.id}
                    className="rounded-lg border border-border bg-muted/20 p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {draft.title || draft.destination || 'Untitled draft'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(draft.updatedAt)}
                        </p>
                      </div>
                      {draft.repaired && (
                        <Badge variant="secondary" className="shrink-0 text-[10px] gap-0.5">
                          <Wrench className="size-2.5" />
                          Repaired
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => onOpenDraft(draft)}
                      >
                        <FolderOpen className="size-3.5 mr-1" />
                        Open
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => onDuplicateDraft(draft)}
                      >
                        <Copy className="size-3.5 mr-1" />
                        Duplicate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(draft.id)}
                      >
                        <Trash2 className="size-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This draft will be removed. You can’t undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
