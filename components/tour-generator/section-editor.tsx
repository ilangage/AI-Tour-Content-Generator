'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Tour } from '@/lib/schema/tour-schema'
import type { RegeneratableTourSection } from '@/lib/types/section'
import { cn } from '@/lib/utils'

export type SectionValue = string | string[] | Tour['itinerary'] | Tour['faqs'] | Tour['blogTips']

interface SectionEditorProps {
  section: RegeneratableTourSection
  value: SectionValue
  onSave: (value: SectionValue) => void
  onCancel: () => void
}

function normalizeToString(value: SectionValue): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value.every((x) => typeof x === 'string')) return (value as string[]).join('\n')
  return JSON.stringify(value, null, 2)
}

export function SectionEditor({ section, value, onSave, onCancel }: SectionEditorProps) {
  const [editStr, setEditStr] = useState(() => normalizeToString(value))

  useEffect(() => {
    setEditStr(normalizeToString(value))
  }, [value])

  const handleSave = () => {
    if (section === 'title' || section === 'description' || section === 'metaTitle' || section === 'metaDescription') {
      onSave(editStr.trim())
      return
    }
    if (section === 'highlights' || section === 'included') {
      const arr = editStr.split('\n').map((s) => s.trim()).filter(Boolean)
      onSave(arr)
      return
    }
    if (section === 'itinerary' || section === 'faqs' || section === 'blogTips') {
      try {
        const parsed = JSON.parse(editStr) as SectionValue
        onSave(parsed)
      } catch {
        return
      }
      return
    }
    onSave(editStr.trim())
  }

  const isJsonSection = ['itinerary', 'faqs', 'blogTips'].includes(section)
  const rows = isJsonSection ? 14 : section === 'description' ? 8 : 3

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
      <Label className="text-xs font-medium text-muted-foreground">
        Editing: {section}
      </Label>
      <textarea
        value={editStr}
        onChange={(e) => setEditStr(e.target.value)}
        rows={rows}
        className={cn(
          'w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring'
        )}
        spellCheck={!isJsonSection}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>
          Save section
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
