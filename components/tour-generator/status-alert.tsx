'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Loader2, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatusType = 'idle' | 'loading' | 'success' | 'repaired' | 'error'

interface StatusAlertProps {
  status: StatusType
  errorMessage?: string | null
  validationErrors?: Array<{ path: string; message: string }> | null
  repaired?: boolean
  warnings?: string[]
}

export function StatusAlert({
  status,
  errorMessage,
  validationErrors,
  repaired,
  warnings = [],
}: StatusAlertProps) {
  if (status === 'idle') return null

  if (status === 'loading') {
    return (
      <Alert variant="default" className="rounded-lg border-border bg-muted/30">
        <Loader2 className="size-4 animate-spin" />
        <AlertTitle>Generating</AlertTitle>
        <AlertDescription>
          Building tour JSON from your keywords and itinerary. This may take a moment.
        </AlertDescription>
      </Alert>
    )
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive" className="rounded-lg">
        <AlertCircle className="size-4" />
        <AlertTitle>Generation failed</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{errorMessage ?? 'Something went wrong.'}</p>
          {validationErrors && validationErrors.length > 0 && (
            <ul className="list-disc list-inside text-xs mt-2 space-y-0.5">
              {validationErrors.slice(0, 5).map((e, i) => (
                <li key={i}>
                  <span className="font-mono">{e.path}</span>: {e.message}
                </li>
              ))}
              {validationErrors.length > 5 && (
                <li>… and {validationErrors.length - 5} more</li>
              )}
            </ul>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (status === 'success' || status === 'repaired') {
    return (
      <Alert variant="default" className="rounded-lg border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20">
        <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="flex items-center gap-2">
          Tour JSON generated
          {repaired && (
            <Badge variant="secondary" className="text-xs font-normal gap-1">
              <Wrench className="size-3" />
              Repaired
            </Badge>
          )}
        </AlertTitle>
        <AlertDescription>
          {repaired
            ? 'Output was lightly repaired (e.g. trailing commas, quotes) and passed validation.'
            : 'Output passed validation. Review the preview and use Copy or Download if needed.'}
          {warnings.length > 0 && (
            <ul className="list-disc list-inside text-xs mt-2 space-y-0.5 text-muted-foreground">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
