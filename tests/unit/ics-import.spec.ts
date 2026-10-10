import { describe, expect, it } from 'vitest'
import { buildICS, escapeText, foldLine, googleCalendarUrl, isSafeRRule } from '@/lib/ics'
import { mapHeaders, parseDate, processRows, splitName } from '@/lib/memberImport'

describe('ics', () => {
  const ev = {
    uid: 'event-1',
    title: 'Diwali; Laxmi Pooja, evening',
    description: 'Line one\nLine two',
    location: 'Unit 6, New England Complex',
    start: new Date('2026-11-08T18:00:00Z'),
    end: new Date('2026-11-08T21:00:00Z'),
  }
  it('escapes special characters', () => {
    expect(escapeText('a;b,c\nd\\')).toBe(String.raw`a\;b\,c\nd\\`)
  })
  it('folds long lines at 75 octets', () => {
    const folded = foldLine('DESCRIPTION:' + 'x'.repeat(200))
    for (const l of folded.split('\r\n')) expect(Buffer.byteLength(l)).toBeLessThanOrEqual(75)
  })
  it('builds a valid calendar', () => {
    const ics = buildICS([ev, { ...ev, uid: 'weekly', rrule: 'FREQ=WEEKLY;BYDAY=MO' }, { ...ev, uid: 'bad', rrule: 'FREQ=WEEKLY\r\nATTACH:evil' }])
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics).toContain('DTSTART:20261108T180000Z')
    expect(ics).toContain(String.raw`SUMMARY:Diwali\; Laxmi Pooja\, evening`)
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO')
    expect(ics).not.toContain('ATTACH')
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3)
  })
  it('only allows safe recurrence rules', () => {
    expect(isSafeRRule('FREQ=MONTHLY;BYDAY=1TH')).toBe(true)
    expect(isSafeRRule('FREQ=WEEKLY;BYDAY=MO,TU')).toBe(true)
    expect(isSafeRRule('FREQ=SECONDLY')).toBe(false)
  })
  it('creates a Google Calendar link', () => {
    const url = new URL(googleCalendarUrl(ev))
    expect(url.hostname).toBe('calendar.google.com')
    expect(url.searchParams.get('dates')).toBe('20261108T180000Z/20261108T210000Z')
  })
})

describe('member import', () => {
  it('maps the nine Excel headers', () => {
    const map = mapHeaders(['Membership Number', 'Name', 'Address', 'Email', 'Phone Number', 'Receipt Number', 'Opted for Newsletter', 'Member Since', 'Date last membership paid for this year'])
    expect(Object.values(map).sort()).toEqual(['address', 'email', 'lastPaidDate', 'memberSince', 'membershipNumber', 'name', 'newsletterOptIn', 'phone', 'receiptNumber'])
  })
  it('parses UK, ISO and Excel serial dates', () => {
    expect(parseDate('09/10/2026')).toBe('2026-10-09')
    expect(parseDate('2026-01-05')).toBe('2026-01-05')
    expect(parseDate(46000)).toBe('2025-12-09')
    expect(parseDate('31/13/2026')).toBeNull()
  })
  it('splits names', () => {
    expect(splitName('Ramnikbhai K Mashru')).toEqual({ firstName: 'Ramnikbhai K', lastName: 'Mashru' })
  })
  it('reports duplicates and missing emails without guessing', () => {
    const rows = [
      { 'Membership Number': '101', Name: 'Asha Patel', Address: '1 Rock Rd, Peterborough PE1 3BU', Email: 'asha@example.com', 'Opted for Newsletter': 'Yes', 'Member Since': '01/01/1995' },
      { 'Membership Number': '102', Name: 'Ravi Shah', Address: '2 Rock Rd', Email: '' },
      { 'Membership Number': '101', Name: 'Asha P', Email: 'asha2@example.com' },
      { 'Membership Number': '103', Name: 'Meena Joshi', Email: 'ASHA@example.com' },
      { 'Membership Number': '104', Name: 'Existing', Email: 'old@example.com' },
      { 'Membership Number': '', Name: '' },
    ]
    const report = processRows(rows, { emails: new Set(['old@example.com']), numbers: new Set() })
    expect(report.valid.map((v) => v.membershipNumber)).toEqual(['101', '102', '103'])
    expect(report.valid[0]).toMatchObject({ postcode: 'PE1 3BU', newsletterOptIn: true, memberSince: '1995-01-01' })
    expect(report.skipped).toBe(1)
    const msgs = report.issues.map((i) => `${i.rowNumber}:${i.severity}:${i.field}`)
    expect(msgs).toContain('3:warning:email')
    expect(msgs).toContain('3:warning:address')
    expect(msgs).toContain('4:error:membershipNumber')
    expect(msgs).toContain('5:warning:email')
    expect(msgs).toContain('6:error:email')
  })
  it('stops when required columns are missing', () => {
    const report = processRows([{ Foo: 'x' }])
    expect(report.valid).toHaveLength(0)
    expect(report.issues[0].severity).toBe('error')
  })
})
