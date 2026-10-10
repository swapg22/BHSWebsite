import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react'
import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Event, Media } from '@/payload-types'
import { formatGBP, percentOf } from '@/lib/money'
import { mediaAlt, mediaUrl } from '@/lib/data'
import { Badge } from '@/components/ui'

export function RichText({ data, className = '' }: { data: unknown; className?: string }) {
  if (!data || typeof data !== 'object') return null
  return <LexicalRichText data={data as SerializedEditorState} className={`prose-temple ${className}`} />
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/London' })
const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Europe/London' })
const dayFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', timeZone: 'Europe/London' })
const monFmt = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'Europe/London' })

export function formatEventWhen(e: Pick<Event, 'startsAt' | 'endsAt' | 'allDay'>): string {
  const s = new Date(e.startsAt)
  if (e.allDay) return dateFmt.format(s)
  return `${dateFmt.format(s)} · ${timeFmt.format(s).replace(':00', '')}–${timeFmt.format(new Date(e.endsAt)).replace(':00', '')}`
}

export const CATEGORY_LABEL: Record<string, string> = {
  festival: 'Festival',
  worship: 'Daily worship',
  fundraising: 'Fundraising',
  workshop: 'Workshop',
  class: 'Class',
  community: 'Community',
  meeting: 'Meeting',
}

/** Dated poster card for events (spec section 3 pattern: events as dated cards). */
export function EventCard({ event, compact = false }: { event: Event; compact?: boolean }) {
  const img = mediaUrl(event.image as Media, 'card')
  const start = new Date(event.startsAt)
  return (
    <article className="card group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {!compact && (
        <div className="relative aspect-[16/10] overflow-hidden bg-ivory-200">
          <Image
            src={img ?? (event.category === 'community' ? '/images/lunch-club.jpg' : '/images/aarti-thali.jpg')}
            alt={img ? mediaAlt(event.image as Media, '') : ''}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="flex flex-1 gap-4 p-5">
        <div className="flex w-14 shrink-0 flex-col items-center rounded-xl border border-saffron-100 bg-saffron-50 py-2 text-saffron-800" aria-hidden="true">
          <span className="text-xs font-semibold uppercase tracking-wider">{monFmt.format(start)}</span>
          <span className="font-serif text-3xl leading-none">{dayFmt.format(start)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap gap-2">
            <Badge tone={event.category === 'fundraising' ? 'gold' : 'saffron'}>{CATEGORY_LABEL[event.category] ?? event.category}</Badge>
            {event.bookable && <Badge tone="green">Booking open</Badge>}
          </div>
          <h3 className="font-serif text-2xl text-charcoal-900">
            <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0 hover:text-saffron-800">
              {event.title}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal-600">
            <CalendarDays aria-hidden="true" className="h-4 w-4" />
            {formatEventWhen(event)}
          </p>
          {!compact && event.summary && <p className="mt-2 line-clamp-2 text-[0.95rem] text-charcoal-600">{event.summary}</p>}
          {!compact && event.location && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-charcoal-500">
              <MapPin aria-hidden="true" className="h-4 w-4" />
              {event.location.split(',')[0]}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

/** Funds-raised bar toward the appeal target (FR-05). */
export function AppealProgress({ raised, target, donors, stageLabel, tone = 'light' }: { raised: number; target: number; donors?: number; stageLabel?: string | null; tone?: 'light' | 'dark' }) {
  const pct = percentOf(raised, target)
  const dark = tone === 'dark'
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.14em] ${dark ? 'text-gold-300' : 'text-saffron-700'}`}>Raised so far</p>
          <p className={`font-serif text-5xl sm:text-6xl ${dark ? 'text-ivory-50' : 'text-charcoal-900'}`}>{formatGBP(raised)}</p>
        </div>
        <p className={`text-right ${dark ? 'text-ivory-200' : 'text-charcoal-600'}`}>
          of <span className="font-semibold">{formatGBP(target)}</span> target
          {stageLabel && (
            <>
              <br />
              <span className={`text-sm ${dark ? 'text-gold-300' : 'text-saffron-800'}`}>{stageLabel}</span>
            </>
          )}
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-valuetext={`${formatGBP(raised)} raised of ${formatGBP(target)}, ${pct.toFixed(1)} percent`}
        aria-label="New Mandir appeal progress"
        className={`relative mt-5 h-4 overflow-hidden rounded-full ${dark ? 'bg-white/15' : 'bg-ivory-300'}`}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-saffron-600 via-saffron-500 to-gold-400 transition-[width] duration-1000" style={{ width: `${Math.max(pct, 1.5)}%` }} />
      </div>
      <p className={`mt-2 text-sm ${dark ? 'text-ivory-300' : 'text-charcoal-500'}`}>
        {pct.toFixed(1)}% of target{donors ? ` · ${donors} online donors` : ''}
      </p>
    </div>
  )
}

export function ArrowLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Link href={href} className={`group inline-flex min-h-11 items-center gap-2 font-semibold ${light ? 'text-gold-300 hover:text-white' : 'text-saffron-800 hover:text-saffron-900'}`}>
      {children}
      <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

export function ArtistsImpressionLabel({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full bg-charcoal-900/85 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ivory-50 backdrop-blur ${className}`}>
      Artist&apos;s impression, not final design
    </span>
  )
}
