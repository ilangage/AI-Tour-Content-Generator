'use client'

import { CheckCircle2, Circle, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface AIWorkflowStatusProps {
  currentStep: number
}

export function AIWorkflowStatus({ currentStep }: AIWorkflowStatusProps) {
  const steps = [
    { name: 'CSV Parsing', icon: '📋' },
    { name: 'Keyword Analysis', icon: '🔍' },
    { name: 'Content Writing', icon: '✍️' },
    { name: 'SEO Optimization', icon: '⚡' },
    { name: 'Schema Mapping', icon: '🗂️' },
    { name: 'JSON Validation', icon: '✓' },
  ]

  return (
    <Card className="p-6 border border-border space-y-4">
      <h2 className="text-lg font-semibold text-foreground">AI Workflow Status</h2>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isComplete = idx < currentStep
          const isActive = idx === currentStep

          return (
            <div key={idx} className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center">
                {isComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : isActive ? (
                  <div className="relative">
                    <Circle className="w-6 h-6 text-accent animate-pulse" />
                    <Zap className="w-3 h-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-accent" />
                  </div>
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  isComplete ? 'text-green-600 dark:text-green-400' :
                  isActive ? 'text-accent' :
                  'text-muted-foreground'
                }`}>
                  {step.name}
                </p>
              </div>

              {isActive && (
                <div className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-medium">
                  Processing...
                </div>
              )}
            </div>
          )
        })}
      </div>

      {currentStep === 6 && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
          <p className="text-xs font-medium text-green-700 dark:text-green-400">
            ✓ Tour JSON generated successfully
          </p>
        </div>
      )}
    </Card>
  )
}
