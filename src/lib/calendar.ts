import type { Payload } from 'payload'
import { calendar_v3, auth as gauth } from '@googleapis/calendar'
import type { Interval } from '@/lib/booking'

/**
 * Master Google Calendar (FR-16, FR-17). The calendar is owned by the temple's Google Workspace
 * admin account and shared with a service account used by the website. Without credentials the
 * website still prevents double booking using its own bookings and events.
 */

let client: calendar_v3.Calendar | null | undefined

function google(): calendar_v3.Calendar | null {
  if (client !== undefined) return client
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n')
  if (!email || !key || !process.env.GOOGLE_CALENDAR_ID) {
    client = null
    return client
  }
  const jwt = new gauth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/calendar'] })
  client = new calendar_v3.Calendar({ auth: jwt })
  return client
}

export function calendarMode(): 'google' | 'local' {
  return google() ? 'google' : 'local'
}

/** Venues that share physical space: hall hire blocks festivals in the main hall and vice versa. */
const BLOCKING_VENUES: Record<string, string[]> = {
  'main-hall': ['main-hall', 'mandir'],
  'sports-hall': ['sports-hall'],
  kitchen: ['kitchen', 'main-hall'],
  mandir: ['mandir', 'main-hall'],
}

export async function getBusyIntervals(payload: Payload, venue: string, from: Date, to: Date): Promise<Interval[]> {
  const venues = BLOCKING_VENUES[venue] ?? [venue]
  const busy: Interval[] = []

  const bookings = await payload.find({
    collection: 'bookings',
    where: {
      and: [
        { kind: { equals: 'service' } },
        { blocksVenue: { equals: true } },
        { status: { in: ['pending-approval', 'awaiting-payment', 'confirmed'] } },
        { venue: { in: venues } },
        { startsAt: { less_than: to.toISOString() } },
        { endsAt: { greater_than: from.toISOString() } },
      ],
    },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  for (const b of bookings.docs) if (b.startsAt && b.endsAt) busy.push({ start: new Date(b.startsAt), end: new Date(b.endsAt) })

  // Festivals and community events take the main hall
  if (venues.includes('main-hall')) {
    const events = await payload.find({
      collection: 'events',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { category: { in: ['festival', 'fundraising', 'community'] } },
          { startsAt: { less_than: to.toISOString() } },
          { endsAt: { greater_than: from.toISOString() } },
        ],
      },
      limit: 200,
      depth: 0,
      overrideAccess: true,
    })
    for (const e of events.docs) busy.push({ start: new Date(e.startsAt), end: new Date(e.endsAt) })
  }

  const g = google()
  if (g) {
    try {
      const fb = await g.freebusy.query({
        requestBody: { timeMin: from.toISOString(), timeMax: to.toISOString(), items: [{ id: process.env.GOOGLE_CALENDAR_ID! }] },
      })
      for (const b of fb.data.calendars?.[process.env.GOOGLE_CALENDAR_ID!]?.busy ?? []) {
        if (b.start && b.end) busy.push({ start: new Date(b.start), end: new Date(b.end) })
      }
    } catch (err) {
      payload.logger.error({ err, msg: 'Google Calendar free/busy lookup failed; using local bookings only' })
    }
  }
  return busy
}

export interface MasterCalendarEntry {
  title: string
  description?: string
  location?: string
  start: Date
  end: Date
}

export async function writeToMasterCalendar(payload: Payload, entry: MasterCalendarEntry, existingId?: string | null): Promise<string | null> {
  const g = google()
  if (!g) return null
  try {
    const requestBody = {
      summary: entry.title,
      description: entry.description,
      location: entry.location,
      start: { dateTime: entry.start.toISOString(), timeZone: 'Europe/London' },
      end: { dateTime: entry.end.toISOString(), timeZone: 'Europe/London' },
    }
    if (existingId) {
      const res = await g.events.update({ calendarId: process.env.GOOGLE_CALENDAR_ID!, eventId: existingId, requestBody })
      return res.data.id ?? existingId
    }
    const res = await g.events.insert({ calendarId: process.env.GOOGLE_CALENDAR_ID!, requestBody })
    return res.data.id ?? null
  } catch (err) {
    payload.logger.error({ err, msg: 'Failed to write to the master Google Calendar' })
    return null
  }
}

export async function removeFromMasterCalendar(payload: Payload, eventId: string | null | undefined): Promise<void> {
  const g = google()
  if (!g || !eventId) return
  try {
    await g.events.delete({ calendarId: process.env.GOOGLE_CALENDAR_ID!, eventId })
  } catch (err) {
    payload.logger.error({ err, msg: 'Failed to remove an entry from the master Google Calendar' })
  }
}
