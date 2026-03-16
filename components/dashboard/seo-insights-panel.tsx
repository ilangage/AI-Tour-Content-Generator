'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function SEOInsightsPanel() {
  const metrics = [
    { label: 'Primary Keyword', value: 'Machu Picchu tours', status: 'active' },
    { label: 'Secondary Coverage', value: '4 keywords', status: 'good' },
    { label: 'Meta Title Status', value: 'Optimized', status: 'good' },
    { label: 'Meta Description', value: '158 chars', status: 'good' },
    { label: 'FAQ Count', value: '8 entries', status: 'good' },
    { label: 'Readability Score', value: '92%', status: 'excellent' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900'
      case 'good':
        return 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900'
      case 'active':
        return 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900'
      default:
        return 'bg-secondary text-foreground border-border'
    }
  }

  return (
    <Card className="p-4 border border-border space-y-4">
      <h3 className="text-sm font-semibold text-foreground">SEO Insights</h3>

      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric, idx) => (
          <div key={idx} className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">{metric.label}</p>
            <Badge 
              variant="outline"
              className={`text-xs w-full justify-center ${getStatusColor(metric.status)}`}
            >
              {metric.value}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
