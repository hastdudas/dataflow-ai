import Papa from 'papaparse'
import type { ProcessResult } from '@/lib/types'

/**
 * Normalises a column name:
 *  - full-width characters -> half-width
 *  - trims, collapses inner whitespace
 *  - lower-cases ASCII, replaces separators with "_"
 *  - falls back to column_N for empty headers
 */
function normaliseHeader(raw: string, index: number): string {
  const half = raw
    .normalize('NFKC')
    .replace(/\u3000/g, ' ')
    .trim()

  if (half.length === 0) return `column_${index + 1}`

  return half
    .replace(/\s+/g, '_')
    .replace(/[.\-/\\]+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
}

function dedupeHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>()
  return headers.map((name) => {
    const count = seen.get(name) ?? 0
    seen.set(name, count + 1)
    return count === 0 ? name : `${name}_${count + 1}`
  })
}

function cleanCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/\u3000/g, ' ')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function processCsv(input: string, fileName: string): ProcessResult {
  // Strip BOM - Excel on Windows adds one and it corrupts the first header.
  const text = input.replace(/^\uFEFF/, '')

  const parsed = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: 'greedy',
  })

  const rows = (parsed.data as unknown[][]).map((row) =>
    Array.isArray(row) ? row.map(cleanCell) : [],
  )

  if (rows.length === 0) {
    throw new Error('CSVに読み取れる行がありません。')
  }

  const rawHeaders = rows[0]
  const headers = dedupeHeaders(
    rawHeaders.map((h, i) => normaliseHeader(h, i)),
  )

  const body = rows.slice(1)
  const inputRows = body.length

  // 1. drop rows that are entirely blank after trimming
  const nonEmpty = body.filter((row) => row.some((cell) => cell.length > 0))
  const blankRowsRemoved = inputRows - nonEmpty.length

  // 2. pad / trim every row to the header width
  const rectangular = nonEmpty.map((row) => {
    const next = row.slice(0, headers.length)
    while (next.length < headers.length) next.push('')
    return next
  })

  // 3. drop columns that are blank in every row
  const keptColumns: number[] = []
  headers.forEach((_, colIndex) => {
    const hasValue = rectangular.some((row) => row[colIndex].length > 0)
    if (hasValue) keptColumns.push(colIndex)
  })
  const blankColumnsRemoved = headers.length - keptColumns.length

  const finalHeaders = keptColumns.map((i) => headers[i])
  const trimmedRows = rectangular.map((row) => keptColumns.map((i) => row[i]))

  // 4. remove exact duplicate rows, keeping the first occurrence
  const seen = new Set<string>()
  const unique: string[][] = []
  for (const row of trimmedRows) {
    const key = JSON.stringify(row)
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(row)
  }
  const duplicatesRemoved = trimmedRows.length - unique.length

  const csv = Papa.unparse({ fields: finalHeaders, data: unique }, {
    newline: '\r\n',
  })

  const outputName = fileName.replace(/\.csv$/i, '') + '_cleaned.csv'

  return {
    kind: 'csv',
    fileName,
    outputName,
    mimeType: 'text/csv;charset=utf-8',
    // UTF-8 BOM so Excel opens Japanese text correctly.
    content: '\uFEFF' + csv,
    summary: `${inputRows}行 → ${unique.length}行（重複 ${duplicatesRemoved} / 空行 ${blankRowsRemoved} を削除）`,
    stats: {
      入力行数: inputRows,
      出力行数: unique.length,
      重複削除: duplicatesRemoved,
      空行削除: blankRowsRemoved,
      空列削除: blankColumnsRemoved,
      列数: finalHeaders.length,
      統一後の列名: finalHeaders.join(', '),
    },
  }
}
