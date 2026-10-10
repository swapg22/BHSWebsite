import { getPayloadClient } from '@/lib/data'
import { getBusyIntervals } from '@/lib/calendar'
import { ukDateTime } from '@/lib/booking'
import { rateLimit } from '@/lib/rateLimit'

const tz = 'Europe/London'
const hhmm = (d: Date) => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz }).format(d)

/**
 * Busy times for a venue on one day (FR-17), from bookings, published events and the master
 * Google Calendar. Returns times only: no names or booking details are exposed.
 */
export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'local'
  if (!rateLimit(`avail:${ip}`, 60, 60_000).ok) return Response.json({ error: 'Too many requests' }, { status: 429 })
  const url = new URL(req.url)
  const date = url.searchParams.get('date') ?? ''
  const venue = url.searchParams.get('venue') ?? 'mandir'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !['mandir', 'main-hall', 'sports-hall', 'kitchen'].includes(venue)) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
  const payload = await getPayloadClient()
  const dayStart = ukDateTime(date, '00:00')
  const dayEnd = new Date(dayStart.getTime() + 864e5)
  const busy = await getBusyIntervals(payload, venue, dayStart, dayEnd)
  return Response.json(
    {
      busy: busy.map((b) => ({
        start: b.start < dayStart ? '00:00' : hhmm(b.start),
        end: b.end > dayEnd ? '23:59' : hhmm(b.end),
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
