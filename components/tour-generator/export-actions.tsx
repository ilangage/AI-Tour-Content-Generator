'use client'

import { Button } from '@/components/ui/button'
import { Copy, Download } from 'lucide-react'
import type { Tour } from '@/lib/schema/tour-schema'

export interface ExportActionsProps {
  /** Current tour result (may be from generation, draft, or edit/regenerate). */
  result: Tour | null
  /** Disable buttons during generation or other loading. */
  isLoading: boolean
  /** Whether export is allowed (validation-aware). */
  canExport: boolean
  onCopyJson: () => void
  onDownloadJson: () => void
  /** Show "Copied!" on Copy button when true. */
  copySuccess: boolean
  /** Brief message when copy failed (e.g. "No valid JSON to export"). */
  copyError: string | null
  /** Show "Download started" or similar when true. */
  downloadSuccess: boolean
  /** Brief message when download failed. */
  downloadError: string | null
}

export function ExportActions({
  result,
  isLoading,
  canExport,
  onCopyJson,
  onDownloadJson,
  copySuccess,
  copyError,
  downloadSuccess,
  downloadError,
}: ExportActionsProps) {
  const copyLabel = copySuccess ? 'Copied!' : 'Copy JSON'
  const downloadLabel = downloadSuccess ? 'Download started' : 'Download JSON'
  const disabled = isLoading || !result || !canExport

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-col items-start gap-0.5">
        <Button
          variant="outline"
          size="default"
          onClick={onCopyJson}
          disabled={disabled}
          className="shrink-0"
          title={!canExport && result ? 'No valid JSON to export' : 'Copy current tour JSON'}
        >
          <Copy className="size-4" />
          {copyLabel}
        </Button>
        {copyError && (
          <span className="text-xs text-destructive" role="status">
            {copyError}
          </span>
        )}
      </div>
      <div className="flex flex-col items-start gap-0.5">
        <Button
          variant="outline"
          size="default"
          onClick={onDownloadJson}
          disabled={disabled}
          className="shrink-0"
          title={!canExport && result ? 'No valid JSON to export' : 'Download current tour as JSON file'}
        >
          <Download className="size-4" />
          {downloadLabel}
        </Button>
        {downloadError && (
          <span className="text-xs text-destructive" role="status">
            {downloadError}
          </span>
        )}
      </div>
    </div>
  )
}
