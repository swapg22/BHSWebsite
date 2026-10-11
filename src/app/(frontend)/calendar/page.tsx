import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Rss } from 'lucide-react'
import type { Event } from '@/payload-types'
import { getPayloadClient } from '@/lib/data'
import { occurrences } from '@/lib/eventFeed'
import { siteUrl } from '@/lib/payments'
import { PageHeader } from '@/components/ui'

export const metadata: Metadata = { title: 'Calendar', description: 'Month view of festivals, events and regular activities at Bharat Hindu Samaj.' }
export const revalidate = 300

const tz = 'Europe/London'
const keyOf = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(d)
const timeOf = (d: Date) => new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }).format(d).replace(':00', '')

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string; all?: string }> }) {
  const { month, all } = await searchParams
  const now = new Date()
  const [y, m] = /^\d{4}-\d{2}$/.test(month ?? '') ? month!.split('-').map(Number) : [Number(keyOf(now).slice(0, 4)), Number(keyOf(now).slice(5, 7))]
  const first = new Date(Date.UTC(y, m - 1, 1))
  const last = new Date(Date.UTC(y, m, 1))
  const showDaily = all === '1'

  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'events',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { showOnCalendar: { equals: true } },
        { or: [{ and: [{ startsAt: { less_than: last.toISOString() } }, { endsAt: { greater_than: first.toISOString() } }] }, { recurrence: { not_equals: 'none' } }] },
      ],
    },
    limit: 500,
    depth: 0,
  })

  const byDay = new Map<string, { e: Event; start: Date }[]>()
  for (const e of res.docs) {
    if (!showDaily && e.recurrence === 'FREQ=DAILY') continue
    for (const o of occurrences(e, first, last)) {
      const k = keyOf(o.start)
      if (!byDay.has(k)) byDay.set(k, [])
      byDay.get(k)!.push({ e, start: o.start })
    }
  }
  for (const list of byDay.values()) list.sort((a, b) => a.start.getTime() - b.start.getTime())

  const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first)
  const prev = `${m === 1 ? y - 1 : y}-${String(m === 1 ? 12 : m - 1).padStart(2, '0')}`
  const next = `${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, '0')}`
  const leading = (first.getUTCDay() + 6) % 7 // Monday-first grid
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const cells = Array.from({ length: Math.ceil((leading + daysInMonth) / 7) * 7 }, (_, i) => i - leading + 1)
  const todayKey = keyOf(now)
  const webcal = `${siteUrl().replace(/^https?/, 'webcal')}/calendar.ics`
  const q = showDaily ? '&all=1' : ''

  return (
    <>
      <PageHeader eyebrow="Events" title="Calendar" intro="Festivals, events and regular activities. Subscribe to keep the Mandir calendar on your phone.">
        <div className="flex flex-wrap gap-3">
          <a href={webcal} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-kumkum-700 px-5 font-semibold text-white hover:bg-kumkum-800">
            <Rss aria-hidden="true" className="h-5 w-5" /> Subscribe
          </a>
          <a href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-charcoal-400 bg-white px-5 font-semibold hover:bg-ivory-100">
            Add to Google Calendar<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </PageHeader>
      <div className="container-page py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl" aria-live="polite">
            {monthLabel}
          </h2>
          <div className="flex items-center gap-2">
            <Link href={`/calendar?month=${prev}${q}`} className="grid h-11 w-11 place-items-center rounded-full border border-ivory-400 bg-white hover:bg-ivory-100">
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
              <span className="sr-only">Previous month</span>
            </Link>
            <Link href={`/calendar${q ? '?all=1' : ''}`} className="inline-flex min-h-11 items-center rounded-full border border-ivory-400 bg-white px-4 text-sm font-semibold hover:bg-ivory-100">
              Today
            </Link>
            <Link href={`/calendar?month=${next}${q}`} className="grid h-11 w-11 place-items-center rounded-full border border-ivory-400 bg-white hover:bg-ivory-100">
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
              <span className="sr-only">Next month</span>
            </Link>
            <Link href={`/calendar?month=${y}-${String(m).padStart(2, '0')}${showDaily ? '' : '&all=1'}`} className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-kumkum-800 hover:bg-ivory-200">
              {showDaily ? 'Hide daily aarti' : 'Show daily aarti'}
            </Link>
          </div>
        </div>

        {/* Desktop: month grid */}
        <div className="hidden overflow-hidden rounded-3xl border border-ivory-300 bg-ivory-300 md:block">
          <div className="grid grid-cols-7 gap-px text-center text-sm font-semibold uppercase tracking-wider text-charcoal-600" aria-hidden="true">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="bg-ivory-200 py-3">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {cells.map((day, i) => {
              const valid = day >= 1 && day <= daysInMonth
              const k = valid ? `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}` : ''
              const items = valid ? (byDay.get(k) ?? []) : []
              return (
                <div key={i} className={`min-h-32 p-2 ${valid ? 'bg-white' : 'bg-ivory-100'} ${k === todayKey ? 'ring-2 ring-inset ring-kumkum-600' : ''}`}>
                  {valid && <p className={`mb-1 text-sm font-semibold ${k === todayKey ? 'text-kumkum-800' : 'text-charcoal-500'}`}>{day}</p>}
                  <ul className="space-y-1">
                    {items.slice(0, 4).map(({ e, start }) => (
                      <li key={`${e.id}-${start.toISOString()}`}>
                        <Link href={`/events/${e.slug}`} className={`block truncate rounded-md px-1.5 py-1 text-xs font-medium ${e.category === 'festival' ? 'bg-kumkum-50 text-kumkum-900 hover:bg-kumkum-100' : 'bg-ivory-200 text-charcoal-800 hover:bg-ivory-300'}`}>
                          {!e.allDay && <span className="font-semibold">{timeOf(start)} </span>}
                          {e.title}
                        </Link>
                      </li>
                    ))}
                    {items.length > 4 && <li className="px-1.5 text-xs text-charcoal-500">+{items.length - 4} more</li>}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile: agenda list */}
        <ol className="space-y-4 md:hidden">
          {[...byDay.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, items]) => (
              <li key={k} className="card p-4">
                <h3 className="font-serif text-xl">{new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${k}T12:00:00Z`))}</h3>
                <ul className="mt-2 divide-y divide-ivory-300">
                  {items.map(({ e, start }) => (
                    <li key={`${e.id}-${start.toISOString()}`}>
                      <Link href={`/events/${e.slug}`} className="flex min-h-11 items-center gap-3 py-2 hover:text-kumkum-800">
                        <span className="w-16 shrink-0 text-sm font-semibold text-charcoal-500">{e.allDay ? 'All day' : timeOf(start)}</span>
                        <span>{e.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          {byDay.size === 0 && <li className="text-charcoal-600">No events this month.</li>}
        </ol>
      </div>
    </>
  )
}
