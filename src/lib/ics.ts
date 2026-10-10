/** iCalendar (RFC 5545) feed and add-to-calendar links (FR-14). */

export interface CalendarEvent {
  uid: string
  title: string
  description?: string
  location?: string
  start: Date
  end: Date
  allDay?: boolean
  url?: string
  rrule?: string // e.g. FREQ=WEEKLY;BYDAY=MO
  updatedAt?: Date
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function icsDateTime(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
    d.getUTCMinutes(),
  )}${pad(d.getUTCSeconds())}Z`
}

function icsDate(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`
}

export function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Lines longer than 75 octets must be folded (RFC 5545 3.1). */
export function foldLine(line: string): string {
  const bytes = Buffer.from(line, 'utf8')
  if (bytes.length <= 75) return line
  const parts: string[] = []
  let current = ''
  let currentBytes = 0
  for (const ch of line) {
    const len = Buffer.byteLength(ch, 'utf8')
    const limit = parts.length === 0 ? 75 : 74
    if (currentBytes + len > limit) {
      parts.push(current)
      current = ''
      currentBytes = 0
    }
    current += ch
    currentBytes += len
  }
  parts.push(current)
  return parts.join('\r\n ')
}

const SAFE_RRULE = /^(FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY))(;(INTERVAL=\d{1,2}|BYDAY=((-?\d)?(MO|TU|WE|TH|FR|SA|SU),?)+|COUNT=\d{1,3}|UNTIL=\d{8}(T\d{6}Z)?))*$/

export function isSafeRRule(rrule: string): boolean {
  return SAFE_RRULE.test(rrule)
}

export function buildICS(events: CalendarEvent[], calName = 'Bharat Hindu Samaj'): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bharat Hindu Samaj//Website//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(calName)}`,
    'X-WR-TIMEZONE:Europe/London',
  ]
  const stamp = icsDateTime(new Date())
  for (const e of events) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${e.uid}@bharathindusamaj.co.uk`)
    lines.push(`DTSTAMP:${e.updatedAt ? icsDateTime(e.updatedAt) : stamp}`)
    if (e.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${icsDate(e.start)}`)
      const end = new Date(e.start)
      end.setUTCDate(end.getUTCDate() + 1)
      lines.push(`DTEND;VALUE=DATE:${icsDate(e.end > e.start ? e.end : end)}`)
    } else {
      lines.push(`DTSTART:${icsDateTime(e.start)}`)
      lines.push(`DTEND:${icsDateTime(e.end)}`)
    }
    lines.push(`SUMMARY:${escapeText(e.title)}`)
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`)
    if (e.location) lines.push(`LOCATION:${escapeText(e.location)}`)
    if (e.url) lines.push(`URL:${e.url}`)
    if (e.rrule && isSafeRRule(e.rrule)) lines.push(`RRULE:${e.rrule}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

export function googleCalendarUrl(e: CalendarEvent): string {
  const dates = e.allDay
    ? `${icsDate(e.start)}/${icsDate(new Date(e.start.getTime() + 864e5))}`
    : `${icsDateTime(e.start)}/${icsDateTime(e.end)}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates,
    details: [e.description, e.url].filter(Boolean).join('\n\n'),
    location: e.location ?? '',
    ctz: 'Europe/London',
  })
  if (e.rrule && isSafeRRule(e.rrule)) params.set('recur', `RRULE:${e.rrule}`)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function outlookCalendarUrl(e: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: e.title,
    startdt: e.start.toISOString(),
    enddt: e.end.toISOString(),
    body: e.description ?? '',
    location: e.location ?? '',
  })
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}
