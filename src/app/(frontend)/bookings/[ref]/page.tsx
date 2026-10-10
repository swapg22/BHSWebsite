import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCurrentMember, getPayloadClient } from '@/lib/data'
import { readToken } from '@/lib/signing'
import { isReference } from '@/lib/reference'
import { formatGBP } from '@/lib/money'
import { BOOKING_STATUS_LABELS } from '@/lib/labels'
import { payForBooking } from '@/app/(frontend)/actions/booking'
import { Badge } from '@/components/ui'
import { CancelBookingForm } from '@/components/CancelBookingForm'

export const metadata: Metadata = { title: 'Your booking', robots: { index: false } }
export const dynamic = 'force-dynamic'

const fmt = (d?: string | null) => (d ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/London' }).format(new Date(d)) : '')

/** Manage or pay for a booking from the link in an email, without signing in. */
export default async function ManageBooking({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ t?: string; failed?: string }> }) {
  const { ref } = await params
  const { t, failed } = await searchParams
  if (!isReference(ref)) notFound()
  const payload = await getPayloadClient()
  const b = (await payload.find({ collection: 'bookings', where: { reference: { equals: ref } }, limit: 1, overrideAccess: true, depth: 0 })).docs[0]
  if (!b) notFound()
  const member = await getCurrentMember()
  const owner = typeof b.member === 'object' ? b.member?.id : b.member
  if (readToken<{ ref: string }>(t)?.ref !== ref && !(member && owner === member.id)) notFound()
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Booking {b.reference}</p>
        <h1 className="mt-2 text-4xl">{b.itemTitle}</h1>
        <div className="mt-3"><Badge tone={b.status === 'confirmed' ? 'green' : 'saffron'}>{BOOKING_STATUS_LABELS[b.status]}</Badge></div>
        {failed && <p role="alert" className="mt-4 text-[#b42318]">The payment did not go through. Please try again.</p>}
        <dl className="card mt-6 divide-y divide-ivory-300">
          {[
            ['When', fmt(b.startsAt)],
            ['Places', String(b.quantity ?? 1)],
            ['Total', b.amount ? formatGBP(b.amount) : 'Free'],
            ['Paid', b.amountPaid ? formatGBP(b.amountPaid) : '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between px-6 py-4"><dt className="text-charcoal-600">{k}</dt><dd className="font-semibold">{v}</dd></div>
          ))}
        </dl>
        {b.status === 'awaiting-payment' && (
          <form action={payForBooking} className="mt-6">
            <input type="hidden" name="reference" value={b.reference} />
            <input type="hidden" name="t" value={t ?? ''} />
            <button className="min-h-12 w-full cursor-pointer rounded-full bg-saffron-700 px-6 font-semibold text-white hover:bg-saffron-800">Pay {formatGBP(b.amount ?? 0)} now</button>
          </form>
        )}
        {['pending-approval', 'awaiting-payment', 'confirmed', 'waitlisted'].includes(b.status) && <CancelBookingForm reference={b.reference} token={t ?? ''} />}
      </div>
    </div>
  )
}
