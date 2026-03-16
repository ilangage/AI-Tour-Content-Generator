'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface RawJsonTabProps {
  jsonString: string
}

export function RawJsonTab({ jsonString }: RawJsonTabProps) {
  return (
    <ScrollArea className="h-[420px] w-full rounded-md border border-border">
      <pre
        className={cn(
          'p-4 text-xs font-mono text-foreground whitespace-pre break-words',
          'min-h-full'
        )}
      >
        {jsonString || 'No output yet.'}
      </pre>
    </ScrollArea>
  )
}
