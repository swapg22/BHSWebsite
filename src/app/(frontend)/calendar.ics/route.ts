import { getPayloadClient } from '@/lib/data'
import { buildICS } from '@/lib/ics'
import { toCalendarEvent } from '@/lib/eventFeed'

export const revalidate = 900

/** Public calendar feed (FR-14): subscribe from Google Calendar, Apple Calendar or Outlook. */
export async function GET() {
  const payload = await getPayloadClient()
  const since = new Date(Date.now() - 60 * 864e5).toISOString()
  const res = await payload.find({
    collection: 'events',
    where: { and: [{ _status: { equals: 'published' } }, { showOnCalendar: { equals: true } }, { or: [{ endsAt: { greater_than: since } }, { recurrence: { not_equals: 'none' } }] }] },
    sort: 'startsAt',
    limit: 500,
    depth: 0,
  })
  return new Response(buildICS(res.docs.map(toCalendarEvent)), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'public, max-age=900' },
  })
}
