import type { Event } from '@/payload-types'
import type { CalendarEvent } from '@/lib/ics'
import { siteUrl } from '@/lib/payments'

const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

/** Converts an event's recurrence choice to a safe RRULE string. */
export function rruleFor(e: Pick<Event, 'recurrence' | 'recurrenceUntil' | 'startsAt'>): string | undefined {
  if (!e.recurrence || e.recurrence === 'none') return undefined
  const start = new Date(e.startsAt)
  const day = BYDAY[start.getUTCDay()]
  let rule: string
  if (e.recurrence === 'monthly-weekday') {
    const nth = Math.ceil(start.getUTCDate() / 7)
    rule = `FREQ=MONTHLY;BYDAY=${nth}${day}`
  } else if (e.recurrence.startsWith('FREQ=WEEKLY')) rule = `${e.recurrence};BYDAY=${day}`
  else rule = e.recurrence
  if (e.recurrenceUntil) rule += `;UNTIL=${new Date(e.recurrenceUntil).toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`
  return rule
}

export function toCalendarEvent(e: Event): CalendarEvent {
  return {
    uid: `event-${e.id}`,
    title: e.title,
    description: e.summary ?? undefined,
    location: e.location ?? undefined,
    start: new Date(e.startsAt),
    end: new Date(e.endsAt),
    allDay: e.allDay ?? false,
    url: `${siteUrl()}/events/${e.slug}`,
    rrule: rruleFor(e),
    updatedAt: new Date(e.updatedAt),
  }
}

/** Expands recurring events into concrete occurrences within a date range (for the month view). */
export function occurrences(e: Event, from: Date, to: Date): { start: Date; end: Date }[] {
  const start = new Date(e.startsAt)
  const end = new Date(e.endsAt)
  const duration = end.getTime() - start.getTime()
  if (!e.recurrence || e.recurrence === 'none') return start < to && end > from ? [{ start, end }] : []
  const until = e.recurrenceUntil ? new Date(e.recurrenceUntil) : to
  const out: { start: Date; end: Date }[] = []
  const cursor = new Date(start)
  const step = (d: Date) => {
    if (e.recurrence === 'FREQ=DAILY') d.setUTCDate(d.getUTCDate() + 1)
    else if (e.recurrence === 'FREQ=WEEKLY') d.setUTCDate(d.getUTCDate() + 7)
    else if (e.recurrence === 'FREQ=WEEKLY;INTERVAL=2') d.setUTCDate(d.getUTCDate() + 14)
    else {
      const nth = Math.ceil(start.getUTCDate() / 7)
      const dow = start.getUTCDay()
      d.setUTCDate(1)
      d.setUTCMonth(d.getUTCMonth() + 1)
      while (d.getUTCDay() !== dow) d.setUTCDate(d.getUTCDate() + 1)
      d.setUTCDate(d.getUTCDate() + (nth - 1) * 7)
    }
  }
  let guard = 0
  while (cursor <= until && cursor < to && guard++ < 800) {
    if (cursor.getTime() + duration > from.getTime()) out.push({ start: new Date(cursor), end: new Date(cursor.getTime() + duration) })
    step(cursor)
  }
  return out
}
