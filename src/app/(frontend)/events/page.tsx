import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, Rss } from 'lucide-react'
import { getPayloadClient } from '@/lib/data'
import { PageHeader } from '@/components/ui'
import { EventCard, CATEGORY_LABEL } from '@/components/shared'

export const metadata: Metadata = { title: 'Events', description: 'Festivals, workshops, fundraisers and community events at Bharat Hindu Samaj.' }
export const revalidate = 300

const FILTERS = ['all', 'festival', 'fundraising', 'workshop', 'community', 'class'] as const

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const active = FILTERS.includes(category as (typeof FILTERS)[number]) ? category! : 'all'
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'events',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { endsAt: { greater_than: new Date().toISOString() } },
        { recurrence: { equals: 'none' } },
        ...(active !== 'all' ? [{ category: { equals: active } }] : []),
      ],
    },
    sort: 'startsAt',
    limit: 60,
    depth: 1,
  })

  return (
    <>
      <PageHeader eyebrow="What’s on" title="Events at the Mandir" intro="Festivals, fundraisers, workshops and community gatherings. Add any event to your own calendar in one click.">
        <div className="flex flex-wrap gap-3">
          <Link href="/calendar" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal-400 bg-white px-5 font-semibold hover:bg-ivory-100">
            <CalendarDays aria-hidden="true" className="h-5 w-5" /> Month view
          </Link>
          <a href="/calendar.ics" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-charcoal-400 bg-white px-5 font-semibold hover:bg-ivory-100">
            <Rss aria-hidden="true" className="h-5 w-5" /> Subscribe to the calendar
          </a>
        </div>
      </PageHeader>
      <div className="container-page py-12 sm:py-16">
        <nav aria-label="Filter events" className="mb-10">
          <ul className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <li key={f}>
                <Link
                  href={f === 'all' ? '/events' : `/events?category=${f}`}
                  aria-current={active === f ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-semibold transition-colors ${active === f ? 'border-kumkum-700 bg-kumkum-700 text-white' : 'border-ivory-400 bg-white text-charcoal-700 hover:border-charcoal-400'}`}
                >
                  {f === 'all' ? 'All events' : f === 'class' ? 'Classes' : `${CATEGORY_LABEL[f]}s`}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {res.docs.length === 0 ? (
          <p className="rounded-3xl border border-ivory-300 bg-white p-10 text-center text-lg text-charcoal-600">No upcoming events in this category. Please check back soon.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {res.docs.map((e) => (
              <li key={e.id} className="reveal">
                <EventCard event={e} />
              </li>
            ))}
          </ul>
        )}
        <p className="mt-12 text-charcoal-600">
          Looking for weekly classes? See the <Link href="/activities" className="font-semibold text-kumkum-800 underline">activities timetable</Link>. Daily aarti is at the times shown at the top of every page.
        </p>
      </div>
    </>
  )
}
