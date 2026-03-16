'use client'

import { useState } from 'react'
import { Upload, Check, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Keyword {
  keyword: string
  volume: number
  intent: string
  priority: string
}

interface KeywordUploadProps {
  keywords: Keyword[]
  setKeywords: (keywords: Keyword[]) => void
}

export function KeywordUpload({ keywords, setKeywords }: KeywordUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState<string>('')

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) {
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    setFileName(file.name)
    // Mock CSV parsing - in production would parse actual CSV
    const mockKeywords: Keyword[] = [
      { keyword: 'Machu Picchu tours', volume: 12500, intent: 'Commercial', priority: 'High' },
      { keyword: 'Peru adventure travel', volume: 8900, intent: 'Informational', priority: 'High' },
      { keyword: 'Sacred Valley hikes', volume: 5600, intent: 'Commercial', priority: 'Medium' },
      { keyword: 'Cusco travel packages', volume: 7200, intent: 'Commercial', priority: 'High' },
    ]
    setKeywords(mockKeywords)
  }

  return (
    <Card className="p-6 border border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Keyword CSV Upload</h2>
          {keywords.length > 0 && <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Keyword Data Loaded</Badge>}
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? 'border-accent bg-accent/5'
              : 'border-border bg-secondary hover:bg-secondary/60'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="font-medium text-foreground">Drag and drop your CSV file here</p>
            <p className="text-sm text-muted-foreground">or</p>
            <label className="text-accent hover:text-accent/80 font-medium cursor-pointer">
              browse files
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {fileName && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div className="flex-1">
              <p className="font-medium text-green-900 dark:text-green-300">{fileName}</p>
              <p className="text-sm text-green-700 dark:text-green-400">{keywords.length} keywords parsed</p>
            </div>
          </div>
        )}

        {keywords.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 font-semibold text-foreground">Keyword</th>
                  <th className="text-left py-2 px-2 font-semibold text-foreground">Volume</th>
                  <th className="text-left py-2 px-2 font-semibold text-foreground">Intent</th>
                  <th className="text-left py-2 px-2 font-semibold text-foreground">Priority</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-secondary/30">
                    <td className="py-2 px-2 text-foreground">{kw.keyword}</td>
                    <td className="py-2 px-2 text-muted-foreground">{kw.volume.toLocaleString()}</td>
                    <td className="py-2 px-2">
                      <Badge variant="outline" className="text-xs">{kw.intent}</Badge>
                    </td>
                    <td className="py-2 px-2">
                      <Badge 
                        className={`text-xs ${
                          kw.priority === 'High' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400'
                        }`}
                      >
                        {kw.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  )
}
