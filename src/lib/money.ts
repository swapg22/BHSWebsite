/** All money is stored as integer pence to avoid floating point errors. */

export function formatGBP(pence: number, opts: { showPence?: boolean } = {}): string {
  const showPence = opts.showPence ?? pence % 100 !== 0
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: showPence ? 2 : 0,
    maximumFractionDigits: showPence ? 2 : 0,
  }).format(pence / 100)
}

export function formatMoney(pence: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(pence / 100)
}

/** Parse a user-typed amount such as "25", "£25.50" or "1,000" into pence. Returns null if invalid. */
export function parseAmountToPence(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null
  const cleaned = String(input).replace(/[£,\s]/g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null
  const [whole, frac = ''] = cleaned.split('.')
  const pence = Number(whole) * 100 + Number(frac.padEnd(2, '0'))
  return Number.isSafeInteger(pence) ? pence : null
}

export function percentOf(part: number, whole: number): number {
  if (whole <= 0) return 0
  return Math.min(100, Math.max(0, (part / whole) * 100))
}
