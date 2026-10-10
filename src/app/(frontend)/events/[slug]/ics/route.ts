import { getPayloadClient } from '@/lib/data'
import { buildICS } from '@/lib/ics'
import { toCalendarEvent } from '@/lib/eventFeed'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'events', where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] }, limit: 1, depth: 0 })
  const event = res.docs[0]
  if (!event) return new Response('Not found', { status: 404 })
  return new Response(buildICS([toCalendarEvent(event)]), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug.replace(/[^a-z0-9-]/g, '')}.ics"`,
    },
  })
}
