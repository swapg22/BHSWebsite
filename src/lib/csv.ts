/** Minimal RFC 4180 CSV writer with formula-injection protection for spreadsheet exports. */

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  let s = value instanceof Date ? value.toISOString() : String(value)
  // Prevent CSV/formula injection when the file is opened in Excel or Sheets
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`
  return s
}

export function toCSV(rows: unknown[][], header?: string[]): string {
  const all = header ? [header, ...rows] : rows
  return all.map((r) => r.map(escapeCell).join(',')).join('\r\n') + '\r\n'
}

export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename.replace(/[^\w.\-]/g, '_')}"`,
      'Cache-Control': 'no-store',
    },
  })
}
