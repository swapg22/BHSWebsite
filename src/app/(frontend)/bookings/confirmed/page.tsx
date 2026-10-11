import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/data'
import { isReference } from '@/lib/reference'
import { BOOKING_STATUS_LABELS } from '@/lib/labels'
import { ButtonLink, LotusMark } from '@/components/ui'

export const metadata: Metadata = { title: 'Booking received', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function BookingConfirmed({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams
  const payload = await getPayloadClient()
  const b = ref && isReference(ref) ? (await payload.find({ collection: 'bookings', where: { reference: { equals: ref } }, limit: 1, overrideAccess: true, depth: 0 })).docs[0] : null
  const heading = !b ? 'Thank you' : b.status === 'confirmed' ? 'You’re booked' : b.status === 'waitlisted' ? 'You’re on the waiting list' : b.status === 'pending-approval' ? 'Request received' : BOOKING_STATUS_LABELS[b.status]
  const body = !b
    ? 'Your booking has been received.'
    : b.status === 'confirmed'
      ? `Your booking for ${b.itemTitle} is confirmed. We have emailed your confirmation with a link to add it to your calendar.`
      : b.status === 'waitlisted'
        ? `${b.itemTitle} is full right now. We'll email you if a place opens up.`
        : b.status === 'pending-approval'
          ? `The temple office will review your request for ${b.itemTitle} and email you once it is approved.`
          : 'We have emailed you the details.'
  return (
    <div className="container-page py-20 text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-kumkum-700 text-ivory-50"><LotusMark className="h-11 w-11" /></span>
      <h1 className="mt-6 text-5xl">{heading}</h1>
      <p className="mx-auto mt-4 max-w-xl text-xl text-charcoal-700">{body}</p>
      {b && <p className="mt-2 text-charcoal-600">Reference <strong>{b.reference}</strong></p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/account">My bookings</ButtonLink>
        <ButtonLink href="/events" variant="secondary">More events</ButtonLink>
      </div>
    </div>
  )
}
