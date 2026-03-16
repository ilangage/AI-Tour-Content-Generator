'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { JSONOutputPreview } from '@/components/dashboard/json-output-preview'

const API_ENDPOINT = '/api/tour/generate'
const FORM_FIELD_CSV = 'csv'
const FORM_FIELD_ITINERARY = 'itinerary'

export function TourGeneratorForm() {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [itineraryText, setItineraryText] = useState('')
  const [generatedJSON, setGeneratedJSON] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Array<{ path: string; message: string }> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setCsvFile(file ?? null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors(null)
    setGeneratedJSON('')

    if (!csvFile) {
      setError('Please upload a keyword research CSV file.')
      return
    }
    const trimmed = itineraryText.trim()
    if (!trimmed) {
      setError('Please enter raw tour itinerary details.')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append(FORM_FIELD_CSV, csvFile)
      formData.append(FORM_FIELD_ITINERARY, trimmed)

      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Generation failed')
        setValidationErrors(data.validationErrors ?? null)
        return
      }

      const result = data.data
      if (result === undefined) {
        setError('No data in response')
        return
      }
      setGeneratedJSON(JSON.stringify(result, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setValidationErrors(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 border border-border space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Step 2: AI Tour Content Generator
        </h2>

        {/* CSV upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Keyword research CSV
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 p-4 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              {csvFile ? (
                <span className="text-sm text-foreground font-medium truncate block">
                  {csvFile.name}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Click to upload or drag a CSV file
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Itinerary textarea */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Raw tour itinerary details
          </label>
          <textarea
            value={itineraryText}
            onChange={(e) => {
              setItineraryText(e.target.value)
              setError(null)
            }}
            placeholder="Paste or type tour itinerary: destinations, days, activities, inclusions, etc."
            className="w-full min-h-[200px] px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            disabled={isLoading}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Generating…
            </>
          ) : (
            'Generate Tour JSON'
          )}
        </Button>
      </Card>

      {/* Error area */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 space-y-2">
          <p className="text-sm font-medium text-destructive">{error}</p>
          {validationErrors && validationErrors.length > 0 && (
            <ul className="text-xs text-destructive/90 list-disc list-inside space-y-1">
              {validationErrors.map((e, i) => (
                <li key={i}><span className="font-mono">{e.path}</span>: {e.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Output preview */}
      <div>
        <JSONOutputPreview jsonData={generatedJSON} />
      </div>
    </form>
  )
}
