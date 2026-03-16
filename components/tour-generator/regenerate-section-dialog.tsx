'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { RegeneratableTourSection } from '@/lib/types/section'
import { Loader2 } from 'lucide-react'

interface RegenerateSectionDialogProps {
  open: boolean
  section: RegeneratableTourSection | null
  onClose: () => void
  onConfirm: (instruction: string) => void
  isLoading: boolean
  error: string | null
}

const SECTION_LABELS: Record<RegeneratableTourSection, string> = {
  title: 'Title',
  description: 'Description',
  highlights: 'Highlights',
  included: 'Included',
  itinerary: 'Itinerary',
  blogTips: 'Blog tips',
  faqs: 'FAQs',
  metaTitle: 'Meta title',
  metaDescription: 'Meta description',
}

export function RegenerateSectionDialog({
  open,
  section,
  onClose,
  onConfirm,
  isLoading,
  error,
}: RegenerateSectionDialogProps) {
  const [instruction, setInstruction] = useState('')

  const handleConfirm = () => {
    onConfirm(instruction.trim())
    setInstruction('')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setInstruction('')
      onClose()
    }
  }

  const label = section ? SECTION_LABELS[section] : ''

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Regenerate: {label}</DialogTitle>
          <DialogDescription>
            AI will rewrite only this section. Optional: add an instruction (e.g. &quot;Make this more luxurious&quot;, &quot;Shorten for SEO&quot;).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="section-instruction">Instruction (optional)</Label>
          <textarea
            id="section-instruction"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Make the tone more premium, shorten for SEO..."
            rows={2}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            disabled={isLoading}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Regenerating…
              </>
            ) : (
              'Regenerate'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
