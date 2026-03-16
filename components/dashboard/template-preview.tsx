'use client'

import { useState } from 'react'
import { ChevronDown, Lock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function TemplatePreview() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    basics: true,
    itinerary: true,
    mapStops: false,
    thingsToDo: false,
    faqs: false,
  })

  const toggleExpanded = (section: string) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const renderField = (name: string, type: string, isArray = false) => (
    <div className="flex items-center justify-between py-2 px-3 text-sm hover:bg-secondary/50 rounded">
      <span className="text-foreground font-mono">{name}</span>
      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
        {isArray ? `${type}[]` : type}
      </span>
    </div>
  )

  const FieldGroup = ({ 
    title, 
    fields, 
    id 
  }: { 
    title: string
    fields: Array<[string, string, boolean?]>
    id: string 
  }) => (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => toggleExpanded(id)}
        className="w-full flex items-center justify-between p-3 bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <span className="font-medium text-foreground">{title}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${expanded[id] ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded[id] && (
        <div className="p-3 bg-card space-y-1 border-t border-border">
          {fields.map(([name, type, isArray], idx) => (
            <div key={idx}>
              {renderField(name, type, isArray)}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Card className="p-6 border border-border space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Template Structure Preview</h2>
        <Badge className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
          <Lock className="w-3 h-3" />
          Locked
        </Badge>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <FieldGroup
          id="basics"
          title="Basic Fields"
          fields={[
            ['id', 'string'],
            ['title', 'string'],
            ['location', 'string'],
            ['destination', 'string'],
            ['duration', 'string'],
            ['price', 'string'],
            ['rating', 'number'],
            ['reviews', 'number'],
            ['image', 'string'],
            ['tag', 'string'],
            ['maxTravelers', 'number'],
            ['groupSize', 'string'],
            ['description', 'string'],
          ]}
        />

        <FieldGroup
          id="highlights"
          title="Highlights"
          fields={[
            ['highlights', 'string', true],
          ]}
        />

        <FieldGroup
          id="itinerary"
          title="Itinerary"
          fields={[
            ['day', 'number'],
            ['title', 'string'],
            ['activities', 'string', true],
          ]}
        />

        <FieldGroup
          id="mapStops"
          title="Map Stops"
          fields={[
            ['lat', 'number'],
            ['lng', 'number'],
            ['label', 'string'],
          ]}
        />

        <FieldGroup
          id="thingsToDo"
          title="Things to Do"
          fields={[
            ['title', 'string'],
            ['description', 'string'],
            ['icon', 'string'],
          ]}
        />

        <FieldGroup
          id="faqs"
          title="FAQs"
          fields={[
            ['question', 'string'],
            ['answer', 'string'],
          ]}
        />
      </div>
    </Card>
  )
}
