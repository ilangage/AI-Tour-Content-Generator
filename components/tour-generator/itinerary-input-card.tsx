'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const PLACEHOLDER = `Paste or type your tour itinerary details, for example:
- Destinations and route
- Day-by-day schedule
- Hotel names and stay details
- Inclusions and exclusions
- Highlights and travel notes`

interface ItineraryInputCardProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ItineraryInputCard({
  value,
  onChange,
  disabled = false,
}: ItineraryInputCardProps) {
  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <Label htmlFor="itinerary-input" className="text-sm font-medium text-foreground">
          Raw itinerary details
        </Label>
        <p className="text-xs text-muted-foreground">
          Itinerary, hotels, inclusions, exclusions, highlights, and travel notes.
        </p>
      </CardHeader>
      <CardContent>
        <textarea
          id="itinerary-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={PLACEHOLDER}
          disabled={disabled}
          rows={14}
          className={cn(
            'w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'min-h-[240px]'
          )}
          spellCheck={false}
        />
      </CardContent>
    </Card>
  )
}
