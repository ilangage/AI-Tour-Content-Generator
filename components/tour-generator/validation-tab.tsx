'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Wrench } from 'lucide-react'

interface ValidationTabProps {
  isValid: boolean
  repaired?: boolean
  warnings?: string[]
  validationErrors?: Array<{ path: string; message: string }> | null
}

export function ValidationTab({
  isValid,
  repaired,
  warnings = [],
  validationErrors = null,
}: ValidationTabProps) {
  if (!isValid && !validationErrors?.length) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Generate a tour to see validation results.
        </p>
      </div>
    )
  }

  if (isValid) {
    return (
      <div className="space-y-4">
        <Alert variant="default" className="rounded-lg border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20">
          <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Schema valid</AlertTitle>
          <AlertDescription>
            The generated output matches the locked Tour schema.
          </AlertDescription>
        </Alert>
        {repaired && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3">
            <Wrench className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Output was repaired</p>
              <p className="text-xs text-muted-foreground">
                Conservative fixes (e.g. trailing commas, smart quotes) were applied before validation.
              </p>
            </div>
          </div>
        )}
        {warnings.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Warnings</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <Alert variant="destructive" className="rounded-lg">
      <AlertCircle className="size-4" />
      <AlertTitle>Validation failed</AlertTitle>
      <AlertDescription>
        <p className="mb-2">The output did not match the locked Tour schema.</p>
        {validationErrors && validationErrors.length > 0 && (
          <ul className="list-disc list-inside text-xs space-y-1">
            {validationErrors.map((e, i) => (
              <li key={i}>
                <span className="font-mono">{e.path}</span>: {e.message}
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  )
}
