'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TourContentChatProps {
  content: string
  setContent: (content: string) => void
}

export function TourContentChat({ content, setContent }: TourContentChatProps) {
  const [chips, setChips] = useState<string[]>([])
  const [chipInput, setChipInput] = useState('')

  const chipOptions = [
    'Destination',
    'Tour Duration',
    'Tone / Style',
    'SEO Focus'
  ]

  const toggleChip = (chip: string) => {
    setChips(prev =>
      prev.includes(chip)
        ? prev.filter(c => c !== chip)
        : [...prev, chip]
    )
  }

  return (
    <Card className="p-6 border border-border space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">AI Tour Content Chat</h2>
        <p className="text-sm text-muted-foreground">
          Paste raw tour itinerary, hotel details, inclusions, exclusions, travel notes, and highlights here...
        </p>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste raw tour itinerary, hotel details, inclusions, exclusions, travel notes, and highlights here..."
        className="w-full h-40 p-4 rounded-lg border border-border bg-secondary text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
      />

      <div className="flex flex-wrap gap-2">
        {chipOptions.map(chip => (
          <button
            key={chip}
            onClick={() => toggleChip(chip)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              chips.includes(chip)
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900">
            System Rules Active
          </Badge>
          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900">
            SEO Optimization Enabled
          </Badge>
          <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900">
            Template Locked
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          The AI will analyze the itinerary, apply keyword SEO optimization, and automatically map content into the final tour JSON structure.
        </p>
      </div>
    </Card>
  )
}
