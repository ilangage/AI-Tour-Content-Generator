/**
 * Parse CSV keyword rows, normalize column names, clean values, remove empty rows and duplicates.
 */

import type { NormalizedKeyword } from '@/lib/types/keyword'

const COLUMN_ALIASES: Record<string, string> = {
  keyword: 'keyword',
  keywords: 'keyword',
  'search term': 'keyword',
  'search terms': 'keyword',
  key: 'keyword',
  volume: 'volume',
  'search volume': 'volume',
  searches: 'volume',
  intent: 'intent',
  'search intent': 'intent',
  priority: 'priority',
  priorities: 'priority',
  difficulty: 'difficulty',
  'keyword difficulty': 'difficulty',
  kd: 'difficulty',
  destination: 'destination',
  destinations: 'destination',
  notes: 'notes',
  note: 'notes',
  comment: 'notes',
  comments: 'notes',
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Parse a single CSV line; handles quoted fields. */
export function parseCsvRow(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

/** Split CSV text into rows (array of cells per row). */
export function parseCsvRows(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim())
  const rows: string[][] = []
  for (const line of lines) {
    if (!line) continue
    rows.push(parseCsvRow(line))
  }
  return rows
}

/** Map raw header names to canonical keys. */
export function normalizeColumnNames(headers: string[]): Record<string, number> {
  const mapped: Record<string, number> = {}
  headers.forEach((h, i) => {
    const normalized = normalizeHeader(h)
    const canonical = COLUMN_ALIASES[normalized]
    if (canonical !== undefined) mapped[canonical] = i
  })
  return mapped
}

function trimAndClean(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function safeNumber(value: string, defaultVal: number = 0): number {
  const n = Number(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : defaultVal
}

/**
 * Parse CSV, normalize columns, trim/clean values, drop empty rows, dedupe by keyword.
 * Returns normalized keyword rows. Only rows with a non-empty keyword are kept.
 */
export function normalizeKeywordsFromCsv(csvText: string): NormalizedKeyword[] {
  const rows = parseCsvRows(csvText)
  if (rows.length < 2) return []

  const headers = rows[0]
  const colMap = normalizeColumnNames(headers)
  const seen = new Set<string>()
  const result: NormalizedKeyword[] = []

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i]
    const keywordRaw =
      colMap.keyword >= 0 && cells[colMap.keyword] !== undefined
        ? trimAndClean(String(cells[colMap.keyword]))
        : ''
    if (!keywordRaw) continue

    const keywordLower = keywordRaw.toLowerCase()
    if (seen.has(keywordLower)) continue
    seen.add(keywordLower)

    const volume =
      colMap.volume >= 0 && cells[colMap.volume] !== undefined
        ? safeNumber(cells[colMap.volume], 0)
        : 0
    const intent =
      colMap.intent >= 0 && cells[colMap.intent] !== undefined
        ? trimAndClean(String(cells[colMap.intent]))
        : ''
    const priority =
      colMap.priority >= 0 && cells[colMap.priority] !== undefined
        ? trimAndClean(String(cells[colMap.priority]))
        : ''
    const difficulty =
      colMap.difficulty >= 0 && cells[colMap.difficulty] !== undefined
        ? safeNumber(cells[colMap.difficulty], 0)
        : 0
    const destination =
      colMap.destination >= 0 && cells[colMap.destination] !== undefined
        ? trimAndClean(String(cells[colMap.destination]))
        : ''
    const notes =
      colMap.notes >= 0 && cells[colMap.notes] !== undefined
        ? trimAndClean(String(cells[colMap.notes]))
        : ''

    result.push({
      keyword: keywordRaw,
      volume,
      intent,
      priority,
      difficulty,
      destination,
      notes,
    })
  }

  return result
}
