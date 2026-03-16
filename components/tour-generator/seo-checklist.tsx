'use client'

import type { Tour } from '@/lib/schema/tour-schema'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface SeoChecklistProps {
  tour: Tour
  primaryKeyword?: string | null
}

export function SeoChecklist({ tour, primaryKeyword }: SeoChecklistProps) {
  const keyword = primaryKeyword?.trim()
  if (!keyword) return null

  const lowerKw = keyword.toLowerCase()
  const title = tour.title ?? ''
  const metaTitle = (tour as Tour & { metaTitle?: string }).metaTitle ?? ''
  const metaDescription = (tour as Tour & { metaDescription?: string }).metaDescription ?? ''
  const firstParagraph = (tour.description ?? '').slice(0, 220)

  const checks = [
    {
      label: 'Primary keyword in title',
      ok: title.toLowerCase().includes(lowerKw),
    },
    {
      label: 'Primary keyword in meta title',
      ok: metaTitle.toLowerCase().includes(lowerKw),
    },
    {
      label: 'Primary keyword in meta description',
      ok: metaDescription.toLowerCase().includes(lowerKw),
    },
    {
      label: 'Primary keyword in first paragraph',
      ok: firstParagraph.toLowerCase().includes(lowerKw),
    },
  ]

  const score = checks.filter((c) => c.ok).length

  return (
    <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-foreground">SEO checklist</p>
        <p className="text-xs text-muted-foreground">
          {score}/{checks.length} checks passing
        </p>
      </div>
      <ul className="space-y-1">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2 text-xs">
            {c.ok ? (
              <CheckCircle2 className="size-3.5 text-emerald-500" />
            ) : (
              <AlertCircle className="size-3.5 text-amber-500" />
            )}
            <span className={c.ok ? 'text-foreground' : 'text-muted-foreground'}>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

