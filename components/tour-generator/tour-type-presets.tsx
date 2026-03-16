'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type TourTypePreset = 'day' | 'multi-day' | 'honeymoon' | 'adventure' | 'cultural'

interface TourTypePresetsProps {
  tourType: TourTypePreset
  onTourTypeChange: (value: TourTypePreset) => void
}

export function TourTypePresets({ tourType, onTourTypeChange }: TourTypePresetsProps) {
  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <h2 className="text-sm font-medium text-foreground">Tour type</h2>
        <p className="text-xs text-muted-foreground">
          Nudge the generator toward the right structure and tone for this tour.
        </p>
      </CardHeader>
      <CardContent className="space-y-1">
        <Label className="text-xs">Preset</Label>
        <Select value={tourType} onValueChange={(v) => onTourTypeChange(v as TourTypePreset)}>
          <SelectTrigger size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day tour</SelectItem>
            <SelectItem value="multi-day">Multi-day / package</SelectItem>
            <SelectItem value="honeymoon">Honeymoon / couples</SelectItem>
            <SelectItem value="adventure">Adventure / active</SelectItem>
            <SelectItem value="cultural">Cultural / heritage</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}

