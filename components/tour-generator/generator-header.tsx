'use client'

import { Button } from '@/components/ui/button'
import { Sparkles, RotateCcw, Save, FilePlus } from 'lucide-react'
import { ExportActions } from './export-actions'
import type { Tour } from '@/lib/schema/tour-schema'

interface GeneratorHeaderProps {
  onGenerate: () => void
  onReset: () => void
  onCopyJson: () => void
  onDownloadJson: () => void
  onSaveDraft: () => void
  onUpdateDraft: () => void
  onSaveAsNew: () => void
  isLoading: boolean
  hasResult: boolean
  hasCurrentDraft: boolean
  result: Tour | null
  canExport: boolean
  copySuccess: boolean
  copyError: string | null
  downloadSuccess: boolean
  downloadError: string | null
}

export function GeneratorHeader({
  onGenerate,
  onReset,
  onCopyJson,
  onDownloadJson,
  onSaveDraft,
  onUpdateDraft,
  onSaveAsNew,
  isLoading,
  hasResult,
  hasCurrentDraft,
  result,
  canExport,
  copySuccess,
  copyError,
  downloadSuccess,
  downloadError,
}: GeneratorHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              AI Tour Content Generator
            </h1>
            <p className="text-sm text-muted-foreground">
              Upload keyword CSV and itinerary details to generate SEO-optimized tour JSON.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={onGenerate}
              disabled={isLoading}
              size="default"
              className="shrink-0"
            >
              {isLoading ? 'Generating…' : 'Generate'}
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={onReset}
              disabled={isLoading}
              className="shrink-0"
            >
              <RotateCcw className="size-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              disabled={!hasResult || isLoading}
              className="shrink-0"
              title="Save as new draft"
            >
              <Save className="size-4" />
              Save draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onUpdateDraft}
              disabled={!hasResult || !hasCurrentDraft || isLoading}
              className="shrink-0"
              title="Overwrite current draft"
            >
              Update draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveAsNew}
              disabled={!hasResult || isLoading}
              className="shrink-0"
              title="Save a copy as new draft"
            >
              <FilePlus className="size-4" />
              Save as new
            </Button>
            <ExportActions
              result={result}
              isLoading={isLoading}
              canExport={canExport}
              onCopyJson={onCopyJson}
              onDownloadJson={onDownloadJson}
              copySuccess={copySuccess}
              copyError={copyError}
              downloadSuccess={downloadSuccess}
              downloadError={downloadError}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
