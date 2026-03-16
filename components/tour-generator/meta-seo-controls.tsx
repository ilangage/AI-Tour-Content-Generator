'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type MetaTone = 'balanced' | 'aggressive' | 'soft' | 'luxury'

interface MetaSeoControlsProps {
  metaTitleLength: number
  metaDescriptionLength: number
  metaTone: MetaTone
  onMetaTitleLengthChange: (value: number) => void
  onMetaDescriptionLengthChange: (value: number) => void
  onMetaToneChange: (value: MetaTone) => void
}

export function MetaSeoControls({
  metaTitleLength,
  metaDescriptionLength,
  metaTone,
  onMetaTitleLengthChange,
  onMetaDescriptionLengthChange,
  onMetaToneChange,
}: MetaSeoControlsProps) {
  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <h2 className="text-sm font-medium text-foreground">Meta SEO</h2>
        <p className="text-xs text-muted-foreground">
          Suggest target meta title / description lengths and tone for this tour.
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div className="space-y-1">
          <Label htmlFor="meta-title-length" className="text-xs">
            Meta title length
          </Label>
          <Input
            id="meta-title-length"
            type="number"
            min={30}
            max={80}
            value={metaTitleLength}
            onChange={(e) => onMetaTitleLengthChange(Number(e.target.value) || 0)}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="meta-description-length" className="text-xs">
            Meta description length
          </Label>
          <Input
            id="meta-description-length"
            type="number"
            min={80}
            max={220}
            value={metaDescriptionLength}
            onChange={(e) => onMetaDescriptionLengthChange(Number(e.target.value) || 0)}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Tone</Label>
          <Select value={metaTone} onValueChange={(v) => onMetaToneChange(v as MetaTone)}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
              <SelectItem value="soft">Soft</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

