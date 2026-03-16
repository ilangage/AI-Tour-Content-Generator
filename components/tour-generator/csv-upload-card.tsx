'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CsvUploadCardProps {
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
}

export function CsvUploadCard({
  file,
  onFileChange,
  disabled = false,
}: CsvUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return
    const f = e.dataTransfer.files[0]
    if (f?.name.toLowerCase().endsWith('.csv')) onFileChange(f)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFileChange(null)
    inputRef.current?.value && (inputRef.current.value = '')
  }

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <h2 className="text-sm font-medium text-foreground">Keyword CSV</h2>
        <p className="text-xs text-muted-foreground">
          Upload a keyword research CSV (keyword, volume, intent, priority, etc.)
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            'flex items-center gap-3 rounded-lg border-2 border-dashed p-4 transition-colors',
            isDragOver && 'border-primary/50 bg-primary/5',
            !file && 'border-border hover:border-muted-foreground/30 hover:bg-muted/30 cursor-pointer',
            file && 'border-border bg-muted/20 cursor-default',
            disabled && 'opacity-60 pointer-events-none'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0]
              onFileChange(f ?? null)
            }}
            className="hidden"
          />
          {file ? (
            <>
              <FileText className="size-5 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-foreground truncate flex-1 min-w-0">
                {file.name}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 size-8"
                onClick={handleClear}
                aria-label="Remove file"
              >
                <X className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Upload className="size-5 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">
                Click or drag a CSV file here
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
