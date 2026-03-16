/**
 * CSV keyword parsing for the tour content generator.
 * Parses uploaded CSV safely and returns normalized keyword objects.
 */

export interface ParsedKeyword {
  keyword: string
  volume: number
  intent: string
  priority: string
}

// Map many possible CSV header labels to our canonical column keys.
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
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, ' ')
}

function parseCsvRow(line: string): string[] {
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

/**
 * Parse CSV text into rows. Handles quoted fields and empty lines.
 */
function splitCsvLines(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim())
  const rows: string[][] = []
  for (const line of lines) {
    if (!line) continue
    rows.push(parseCsvRow(line))
  }
  return rows
}

/**
 * Map raw header name to our canonical key (keyword, volume, intent, priority).
 * Missing columns map to empty string and are filled with defaults.
 */
function mapHeaders(headers: string[]): Record<string, number> {
  const mapped: Record<string, number> = {
    keyword: -1,
    volume: -1,
    intent: -1,
    priority: -1,
  }
  headers.forEach((h, i) => {
    const normalized = normalizeHeader(h)
    const canonical = COLUMN_ALIASES[normalized]
    if (canonical !== undefined) mapped[canonical] = i
  })
  return mapped
}

function safeNumber(value: string): number {
  const n = Number(value?.replace(/[^0-9.-]/g, '') ?? 0)
  return Number.isFinite(n) ? n : 0
}

/**
 * Parse uploaded CSV and return normalized array of keyword objects.
 * Handles missing columns gracefully; ignores empty rows.
 */
export function parseKeywordsCsv(csvText: string): ParsedKeyword[] {
  const rows = splitCsvLines(csvText)
  if (rows.length < 2) return []

  const headers = rows[0]
  const map = mapHeaders(headers)
  const result: ParsedKeyword[] = []

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i]
    const keyword =
      map.keyword >= 0 && cells[map.keyword] !== undefined
        ? String(cells[map.keyword]).trim()
        : ''
    if (!keyword) continue

    const volume =
      map.volume >= 0 && cells[map.volume] !== undefined
        ? safeNumber(cells[map.volume])
        : 0
    const intent =
      map.intent >= 0 && cells[map.intent] !== undefined
        ? String(cells[map.intent]).trim()
        : ''
    const priority =
      map.priority >= 0 && cells[map.priority] !== undefined
        ? String(cells[map.priority]).trim()
        : ''

    result.push({ keyword, volume, intent, priority })
  }

  return result
}

/**
 * Primary keyword: highest volume, or first if no volume column.
 */
export function getPrimaryKeyword(keywords: ParsedKeyword[]): ParsedKeyword | null {
  if (keywords.length === 0) return null
  const withVolume = keywords.filter((k) => k.volume > 0)
  if (withVolume.length === 0) return keywords[0]
  return withVolume.reduce((a, b) => (a.volume >= b.volume ? a : b))
}

/**
 * Top N secondary keywords (excluding primary).
 */
export function getSecondaryKeywords(
  keywords: ParsedKeyword[],
  count: number = 10
): ParsedKeyword[] {
  const primary = getPrimaryKeyword(keywords)
  const rest = primary
    ? keywords.filter((k) => k.keyword !== primary.keyword)
    : [...keywords]
  const byVolume = [...rest].sort((a, b) => b.volume - a.volume)
  return byVolume.slice(0, count)
}

/**
 * Build a short keyword summary string for the AI prompt.
 */
export function getKeywordSummaryForPrompt(keywords: ParsedKeyword[]): string {
  if (keywords.length === 0) return 'No keyword data provided.'

  const primary = getPrimaryKeyword(keywords)
  const secondary = getSecondaryKeywords(keywords, 8)
  const lines: string[] = [
    `Total keywords: ${keywords.length}`,
    primary ? `Primary keyword: ${primary.keyword} (volume: ${primary.volume})` : '',
    secondary.length > 0
      ? `Secondary keywords: ${secondary.map((k) => k.keyword).join(', ')}`
      : '',
  ]
  return lines.filter(Boolean).join('\n')
}
