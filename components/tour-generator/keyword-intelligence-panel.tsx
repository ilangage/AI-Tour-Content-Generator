'use client'

import type { KeywordIntelligence } from '@/lib/types/keyword'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface KeywordIntelligencePanelProps {
  intel: KeywordIntelligence | null
  primaryOverride: string
  onPrimaryOverrideChange: (value: string) => void
}

export function KeywordIntelligencePanel({
  intel,
  primaryOverride,
  onPrimaryOverrideChange,
}: KeywordIntelligencePanelProps) {
  const hasData = !!intel && (!!intel.primaryKeyword || intel.secondaryKeywords.length > 0)

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <h2 className="text-sm font-medium text-foreground">Keyword Intelligence</h2>
        <p className="text-xs text-muted-foreground">
          Preview the detected primary and secondary keywords from your CSV. Optionally override
          the primary keyword for this run.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="primary-keyword-override" className="text-xs">
            Primary keyword override (optional)
          </Label>
          <Input
            id="primary-keyword-override"
            value={primaryOverride}
            onChange={(e) => onPrimaryOverrideChange(e.target.value)}
            placeholder={intel?.primaryKeyword || 'e.g. sigiriya rock fortress tour'}
            className="h-8 text-xs"
          />
        </div>

        {hasData ? (
          <div className="space-y-1 text-xs">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Detected primary:</span>{' '}
              {intel?.primaryKeyword || 'None'}
            </p>
            {intel?.secondaryKeywords?.length ? (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Secondary:</span>{' '}
                {intel.secondaryKeywords.join(', ')}
              </p>
            ) : (
              <p className="text-muted-foreground">No secondary keywords detected yet.</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Upload a keyword CSV to see detected primary and secondary keywords.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

