import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CalendarDays, MapPin, Users, Ticket } from 'lucide-react'
import type { Media } from '@/payload-types'
import { getCurrentMember, getPayloadClient, mediaAlt, mediaUrl } from '@/lib/data'
import { formatGBP } from '@/lib/money'
import { googleCalendarUrl, outlookCalendarUrl } from '@/lib/ics'
import { toCalendarEvent } from '@/lib/eventFeed'
import { formStartToken } from '@/lib/formGuard'
import { isActiveMember } from '@/lib/bookingService'
import { Badge } from '@/components/ui'
import { RichText, formatEventWhen, CATEGORY_LABEL, ArrowLink } from '@/components/shared'
import { EventBookingForm } from './EventBookingForm'

export const revalidate = 60

async function getEvent(slug: string) {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'events', where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] }, limit: 1, depth: 1 })
  return res.docs[0] ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = await getEvent((await params).slug)
  return e ? { title: e.title, description: e.summary ?? undefined } : {}
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEvent(slug)
  if (!event) notFound()
  const payload = await getPayloadClient()
  const member = await getCurrentMember()
  const img = mediaUrl(event.image as Media, 'hero')
  const cal = toCalendarEvent(event)
  const past = new Date(event.endsAt) < new Date()

  let placesLeft: number | null = null
  if (event.bookable && event.capacity) {
    const taken = await payload.find({
      collection: 'bookings',
      where: { and: [{ event: { equals: event.id } }, { status: { in: ['pending-approval', 'awaiting-payment', 'confirmed'] } }] },
      limit: 1000,
      depth: 0,
      overrideAccess: true,
      select: { quantity: true },
    })
    placesLeft = Math.max(0, event.capacity - taken.docs.reduce((s, b) => s + (b.quantity ?? 1), 0))
  }

  return (
    <article>
      <header className="relative overflow-hidden bg-charcoal-900 text-ivory-50">
        {img && <Image src={img} alt={mediaAlt(event.image as Media)} fill priority sizes="100vw" className="object-cover opacity-50" />}
        <div className="scrim-left absolute inset-0" aria-hidden="true" />
        <div className="container-page relative py-16 sm:py-24">
          <ArrowLink href="/events" light>
            All events
          </ArrowLink>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{CATEGORY_LABEL[event.category] ?? event.category}</Badge>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl text-white sm:text-6xl">{event.title}</h1>
          <ul className="mt-6 space-y-2 text-lg text-ivory-100">
            <li className="flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="h-5 w-5 text-gold-300" />
              {formatEventWhen(event)}
            </li>
            {event.location && (
              <li className="flex items-center gap-2">
                <MapPin aria-hidden="true" className="h-5 w-5 text-gold-300" />
                {event.location}
              </li>
            )}
          </ul>
        </div>
      </header>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {event.summary && <p className="font-serif text-2xl leading-snug text-charcoal-800">{event.summary}</p>}
          {event.description && <RichText data={event.description} className="mt-6 text-lg" />}
          <div className="mt-10 rounded-3xl border border-ivory-300 bg-white p-6">
            <h2 className="font-serif text-2xl">Add to your calendar</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={googleCalendarUrl(cal)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-charcoal-400 px-5 font-semibold hover:bg-ivory-100">
                Google Calendar<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={`/events/${event.slug}/ics`} className="inline-flex min-h-11 items-center rounded-full border border-charcoal-400 px-5 font-semibold hover:bg-ivory-100">
                Apple / iCal (.ics)
              </a>
              <a href={outlookCalendarUrl(cal)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-charcoal-400 px-5 font-semibold hover:bg-ivory-100">
                Outlook<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-5" aria-labelledby="booking-title">
          <div className="card sticky top-28 p-6 sm:p-8">
            <h2 id="booking-title" className="font-serif text-3xl">
              {event.bookable ? 'Book your place' : 'All are welcome'}
            </h2>
            {event.bookable ? (
              <>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-2xl bg-ivory-100 p-4">
                    <dt className="flex items-center gap-1.5 text-charcoal-500">
                      <Ticket aria-hidden="true" className="h-4 w-4" /> Members
                    </dt>
                    <dd className="mt-1 text-xl font-semibold">{event.memberPrice ? formatGBP(event.memberPrice) : 'Free'}</dd>
                  </div>
                  <div className="rounded-2xl bg-ivory-100 p-4">
                    <dt className="flex items-center gap-1.5 text-charcoal-500">
                      <Ticket aria-hidden="true" className="h-4 w-4" /> Guests
                    </dt>
                    <dd className="mt-1 text-xl font-semibold">{event.guestPrice ? formatGBP(event.guestPrice) : 'Free'}</dd>
                  </div>
                </dl>
                {placesLeft !== null && (
                  <p className="mt-4 flex items-center gap-2 text-charcoal-700">
                    <Users aria-hidden="true" className="h-5 w-5 text-saffron-700" />
                    {placesLeft > 0 ? `${placesLeft} places left` : event.waitlist ? 'Fully booked — join the waiting list' : 'Fully booked'}
                  </p>
                )}
                {past ? (
                  <p className="mt-6 text-charcoal-600">This event has finished.</p>
                ) : (
                  <EventBookingForm
                    eventId={event.id}
                    token={formStartToken()}
                    isMember={isActiveMember(member)}
                    defaults={member ? { name: `${member.firstName} ${member.lastName ?? ''}`.trim(), email: member.email, phone: member.phone ?? '' } : undefined}
                    full={placesLeft === 0}
                    memberPrice={event.memberPrice ?? 0}
                    guestPrice={event.guestPrice ?? 0}
                  />
                )}
              </>
            ) : (
              <p className="mt-3 text-charcoal-600">No booking needed — just come along. Please remember to remove your shoes and dress modestly in the Mandir.</p>
            )}
          </div>
        </aside>
      </div>
    </article>
  )
}
