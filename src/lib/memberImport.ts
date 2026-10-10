/**
 * One-off import of the Excel member list (FR-31).
 * Expected columns (any order, case-insensitive): membership number, name, address, email,
 * phone number, receipt number, opted for newsletter, member since, date last membership paid.
 * Duplicates and missing emails are reported for the membership officer to fix; nothing is guessed.
 */

export interface RawRow {
  [column: string]: unknown
}

export interface ImportedMember {
  rowNumber: number
  membershipNumber: string
  firstName: string
  lastName: string
  address: string
  postcode: string
  email: string | null
  phone: string
  receiptNumber: string
  newsletterOptIn: boolean
  memberSince: string | null // ISO date
  lastPaidDate: string | null // ISO date
}

export interface ImportIssue {
  rowNumber: number
  severity: 'error' | 'warning'
  field: string
  message: string
}

export interface ImportReport {
  valid: ImportedMember[]
  issues: ImportIssue[]
  skipped: number
}

const HEADER_ALIASES: Record<keyof Omit<ImportedMember, 'rowNumber' | 'firstName' | 'lastName' | 'postcode'> | 'name', string[]> = {
  membershipNumber: ['membership number', 'membership no', 'member number', 'member no', 'membership #'],
  name: ['name', 'full name', 'member name'],
  address: ['address', 'home address'],
  email: ['email', 'email address', 'e-mail'],
  phone: ['phone number', 'phone', 'telephone', 'mobile', 'contact number'],
  receiptNumber: ['receipt number', 'receipt no', 'receipt'],
  newsletterOptIn: ['opted for newsletter', 'newsletter', 'newsletter opt-in', 'newsletter opt in'],
  memberSince: ['member since', 'joined', 'date joined'],
  lastPaidDate: ['date last membership paid for this year', 'date last membership paid', 'last paid', 'last paid date'],
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 #-]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function mapHeaders(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const h of headers) {
    const n = norm(h)
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(n) && !Object.values(map).includes(field)) map[h] = field
    }
  }
  return map
}

function cellToString(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  if (typeof v === 'object' && v && 'text' in v) return String((v as { text: unknown }).text ?? '')
  if (typeof v === 'object' && v && 'result' in v) return String((v as { result: unknown }).result ?? '')
  return String(v).trim()
}

/** Accepts Date objects, Excel serial numbers, YYYY-MM-DD and UK DD/MM/YYYY. */
export function parseDate(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10)
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    const d = new Date(Date.UTC(1899, 11, 30) + v * 864e5)
    return d.toISOString().slice(0, 10)
  }
  const s = cellToString(v)
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  m = s.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/)
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3]
    const day = Number(m[1])
    const month = Number(m[2])
    if (day < 1 || day > 31 || month < 1 || month > 12) return null
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  return null
}

function parseBool(v: unknown): boolean {
  const s = cellToString(v).toLowerCase()
  return ['y', 'yes', 'true', '1', 'x', 'opted in'].includes(s)
}

export function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] }
}

const POSTCODE_RE = /([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\s*$/i

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function processRows(rows: RawRow[], existing: { emails: Set<string>; numbers: Set<string> } = { emails: new Set(), numbers: new Set() }): ImportReport {
  const issues: ImportIssue[] = []
  const valid: ImportedMember[] = []
  let skipped = 0
  if (rows.length === 0) return { valid, issues, skipped }

  const headerMap = mapHeaders(Object.keys(rows[0]))
  const required = ['membershipNumber', 'name']
  for (const r of required) {
    if (!Object.values(headerMap).includes(r)) {
      issues.push({ rowNumber: 1, severity: 'error', field: r, message: `Column for "${r}" not found in the header row` })
    }
  }
  if (issues.length) return { valid, issues, skipped: rows.length }

  const seenEmails = new Map<string, number>()
  const seenNumbers = new Map<string, number>()

  rows.forEach((row, i) => {
    const rowNumber = i + 2 // header is row 1
    const get = (field: string) => {
      const key = Object.keys(headerMap).find((k) => headerMap[k] === field)
      return key ? row[key] : undefined
    }
    const name = cellToString(get('name'))
    const membershipNumber = cellToString(get('membershipNumber'))
    if (!name && !membershipNumber) {
      skipped++
      return
    }
    let rowHasError = false
    const err = (field: string, message: string) => {
      issues.push({ rowNumber, severity: 'error', field, message })
      rowHasError = true
    }
    const warn = (field: string, message: string) => issues.push({ rowNumber, severity: 'warning', field, message })

    if (!membershipNumber) err('membershipNumber', 'Missing membership number')
    if (!name) err('name', 'Missing name')

    const emailRaw = cellToString(get('email')).toLowerCase()
    let email: string | null = emailRaw || null
    if (!email) warn('email', 'Missing email: member cannot log in until one is added')
    else if (!EMAIL_RE.test(email)) {
      warn('email', `Email "${emailRaw}" looks invalid and was left blank`)
      email = null
    }

    if (membershipNumber) {
      if (seenNumbers.has(membershipNumber)) err('membershipNumber', `Duplicate of row ${seenNumbers.get(membershipNumber)}`)
      else if (existing.numbers.has(membershipNumber)) err('membershipNumber', 'Already exists in the member database')
      seenNumbers.set(membershipNumber, rowNumber)
    }
    if (email) {
      if (seenEmails.has(email)) warn('email', `Same email as row ${seenEmails.get(email)}: check for a duplicate person or a shared family email`)
      else if (existing.emails.has(email)) err('email', 'Email already belongs to a member in the database')
      seenEmails.set(email, rowNumber)
    }

    const address = cellToString(get('address'))
    const postcode = (address.match(POSTCODE_RE)?.[1] ?? '').toUpperCase()
    if (address && !postcode) warn('address', 'No UK postcode found at the end of the address')

    const memberSinceRaw = get('memberSince')
    const memberSince = parseDate(memberSinceRaw)
    if (cellToString(memberSinceRaw) && !memberSince) warn('memberSince', `Could not read date "${cellToString(memberSinceRaw)}"`)
    const lastPaidRaw = get('lastPaidDate')
    const lastPaidDate = parseDate(lastPaidRaw)
    if (cellToString(lastPaidRaw) && !lastPaidDate) warn('lastPaidDate', `Could not read date "${cellToString(lastPaidRaw)}"`)

    if (rowHasError) return
    const { firstName, lastName } = splitName(name)
    valid.push({
      rowNumber,
      membershipNumber,
      firstName,
      lastName,
      address,
      postcode,
      email,
      phone: cellToString(get('phone')),
      receiptNumber: cellToString(get('receiptNumber')),
      newsletterOptIn: parseBool(get('newsletterOptIn')),
      memberSince,
      lastPaidDate,
    })
  })

  return { valid, issues, skipped }
}
