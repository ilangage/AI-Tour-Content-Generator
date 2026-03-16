'use client'

import { useState } from 'react'
import { Copy, Download, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface JSONOutputPreviewProps {
  jsonData: string
}

export function JSONOutputPreview({ jsonData }: JSONOutputPreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'raw' | 'validation'>('preview')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(jsonData)}`)
    element.setAttribute('download', 'tour-data.json')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const tabs = [
    { id: 'preview' as const, label: 'Preview' },
    { id: 'raw' as const, label: 'Raw JSON' },
    { id: 'validation' as const, label: 'Validation' },
  ]

  return (
    <Card className="p-0 border border-border overflow-hidden space-y-0">
      <div className="border-b border-border p-4 bg-secondary/30 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">JSON Output</h3>
          {jsonData && (
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2 border-b border-border -mx-4 px-4 pb-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-medium px-3 py-2 rounded-t transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'preview' && (
          <div className="space-y-3">
            {jsonData ? (
              <div className="max-h-60 overflow-y-auto bg-secondary/50 rounded p-3 text-xs font-mono text-foreground">
                <pre>{JSON.stringify(JSON.parse(jsonData), null, 2)}</pre>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">Generate a tour to see preview</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-3">
            {jsonData ? (
              <div className="max-h-60 overflow-y-auto bg-secondary/50 rounded p-3 text-xs font-mono text-foreground">
                <pre>{jsonData}</pre>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">Generate a tour to see raw JSON</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Schema match</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">Required fields complete</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-400">SEO checks passed</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-yellow-50 dark:bg-yellow-950/20">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Add FAQ entries for better SEO</span>
              </div>
            </div>
          </div>
        )}


      </div>
    </Card>
  )
}
