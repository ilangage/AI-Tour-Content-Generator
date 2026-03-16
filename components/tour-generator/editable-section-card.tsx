'use client'

import { Button } from '@/components/ui/button'
import { Pencil, RefreshCw, Loader2 } from 'lucide-react'
import { SectionEditor, type SectionValue } from './section-editor'
import type { RegeneratableTourSection } from '@/lib/types/section'
import { cn } from '@/lib/utils'

interface EditableSectionCardProps {
  section: RegeneratableTourSection
  label: string
  value: SectionValue
  isEditing: boolean
  isRegenerating: boolean
  readContent: React.ReactNode
  onEdit: () => void
  onRegenerate: () => void
  onSaveSection: (value: SectionValue) => void
  onCancelEdit: () => void
  sectionActionsEnabled?: boolean
}

export function EditableSectionCard({
  section,
  label,
  value,
  isEditing,
  isRegenerating,
  readContent,
  onEdit,
  onRegenerate,
  onSaveSection,
  onCancelEdit,
  sectionActionsEnabled = true,
}: EditableSectionCardProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </h3>
        {!isEditing && sectionActionsEnabled && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={onEdit}
              disabled={isRegenerating}
            >
              <Pencil className="size-3.5 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <Loader2 className="size-3.5 animate-spin mr-1" />
              ) : (
                <RefreshCw className="size-3.5 mr-1" />
              )}
              Regenerate
            </Button>
          </div>
        )}
      </div>
      {isEditing ? (
        <SectionEditor
          section={section}
          value={value}
          onSave={onSaveSection}
          onCancel={onCancelEdit}
        />
      ) : (
        <div className="text-sm text-foreground">{readContent}</div>
      )}
    </div>
  )
}
