import type { Payload, PayloadRequest } from 'payload'
import type { Booking, Event, Member, Service } from '@/payload-types'
import { decideCapacity, decideRefund, dayNameOf, isSlotFree, priceFor, ukDateTime } from '@/lib/booking'
import { getBusyIntervals, removeFromMasterCalendar, writeToMasterCalendar } from '@/lib/calendar'
import { sendTemplate } from '@/lib/email'
import { googleCalendarUrl } from '@/lib/ics'
import { formatGBP } from '@/lib/money'
import { makeReference } from '@/lib/reference'
import { createToken } from '@/lib/signing'
import { refundPayment, siteUrl } from '@/lib/payments'
import { membershipStatus } from '@/lib/membership'

type Result<T> = { ok: true; value: T } | { ok: false; error: string }

const ukDate = (d: Date | string) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZone: 'Europe/London' }).format(new Date(d))
const ukTime = (d: Date | string) =>
  new Intl.DateTimeFormat('en-GB', { timeStyle: 'short', timeZone: 'Europe/London' }).format(new Date(d))

export function isActiveMember(member: Member | null | undefined): boolean {
  if (!member) return false
  const s = membershipStatus(member.expiryDate ? new Date(member.expiryDate) : null)
  return member.status === 'active' && s !== 'lapsed'
}

/** Link the booker can use to pay or manage a booking without logging in. */
export function bookingLink(reference: string, action: 'pay' | 'manage'): string {
  const t = createToken({ ref: reference, action }, 60 * 60 * 24 * 30)
  return `${siteUrl()}/bookings/${reference}?t=${encodeURIComponent(t)}`
}

async function placesTaken(payload: Payload, eventId: number | string): Promise<number> {
  const res = await payload.find({
    collection: 'bookings',
    where: { and: [{ event: { equals: eventId } }, { status: { in: ['pending-approval', 'awaiting-payment', 'confirmed'] } }] },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
    select: { quantity: true },
  })
  return res.docs.reduce((sum, b) => sum + (b.quantity ?? 1), 0)
}

export interface EventBookingInput {
  eventId: number | string
  name: string
  email: string
  phone?: string
  quantity: number
  dietaryNotes?: string
  member?: Member | null
}

export async function createEventBooking(payload: Payload, input: EventBookingInput): Promise<Result<{ booking: Booking; needsPayment: boolean }>> {
  const event = (await payload.findByID({ collection: 'events', id: input.eventId, overrideAccess: true, depth: 0 }).catch(() => null)) as Event | null
  if (!event || event._status !== 'published' || !event.bookable) return { ok: false, error: 'This event is not taking bookings.' }
  if (new Date(event.startsAt) < new Date()) return { ok: false, error: 'This event has already started.' }

  const taken = await placesTaken(payload, event.id)
  const decision = decideCapacity({ capacity: event.capacity, placesTaken: taken, requested: input.quantity, waitlistEnabled: event.waitlist ?? true })
  if (decision.outcome === 'invalid') return { ok: false, error: decision.reason }
  if (decision.outcome === 'full') return { ok: false, error: 'Sorry, this event is fully booked.' }

  const member = isActiveMember(input.member) ? input.member! : null
  const amount = priceFor({ isMember: Boolean(member), memberPrice: event.memberPrice ?? 0, guestPrice: event.guestPrice ?? 0, quantity: input.quantity })
  const status = decision.outcome === 'waitlist' ? 'waitlisted' : amount > 0 ? 'awaiting-payment' : 'confirmed'

  const booking = await payload.create({
    collection: 'bookings',
    data: {
      reference: makeReference('B'),
      kind: 'event',
      event: event.id,
      itemTitle: event.title,
      member: input.member?.id,
      name: input.name,
      email: input.email,
      phone: input.phone,
      quantity: input.quantity,
      dietaryNotes: input.dietaryNotes,
      date: event.startsAt,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      amount,
      isMemberPrice: Boolean(member),
      status,
    },
    overrideAccess: true,
    context: { skipBookingHooks: true },
  })

  if (status === 'waitlisted') {
    await sendTemplate(payload, { to: booking.email, template: 'booking-waitlisted', data: { name: booking.name, service: event.title, reference: booking.reference } })
  } else if (status === 'confirmed') {
    await sendConfirmation(payload, booking, event.title, event.location ?? undefined)
  }
  return { ok: true, value: { booking, needsPayment: status === 'awaiting-payment' } }
}

export interface ServiceBookingInput {
  serviceId: number | string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  durationMinutes?: number
  quantity?: number
  name: string
  email: string
  phone?: string
  notes?: string
  dietaryNotes?: string
  includeMaterials?: boolean
  venue?: string
  policyAgreed?: boolean
  member?: Member | null
}

export async function createServiceBooking(payload: Payload, input: ServiceBookingInput): Promise<Result<{ booking: Booking; needsPayment: boolean }>> {
  const service = (await payload.findByID({ collection: 'services', id: input.serviceId, overrideAccess: true }).catch(() => null)) as Service | null
  if (!service || service.availability !== 'active') return { ok: false, error: 'This service is not available to book right now.' }
  if (service.requiresPolicyAgreement && !input.policyAgreed) return { ok: false, error: 'Please read and agree to the hire policy.' }

  let start: Date
  try {
    start = ukDateTime(input.date, input.startTime)
  } catch {
    return { ok: false, error: 'Choose a valid date and time.' }
  }
  if (start.getTime() < Date.now() + 24 * 36e5) return { ok: false, error: 'Please choose a date at least one day ahead.' }
  if (start.getTime() > Date.now() + 400 * 864e5) return { ok: false, error: 'Bookings open up to a year ahead.' }
  if (service.availableDays?.length && !service.availableDays.includes(dayNameOf(input.date))) {
    return { ok: false, error: `${service.name} is available on ${service.availableDays.join(', ')} only.` }
  }
  const duration = Math.min(Math.max(input.durationMinutes ?? service.defaultDurationMinutes ?? 120, 30), 12 * 60)
  const end = new Date(start.getTime() + duration * 60000)
  const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
  const startMin = toMinutes(input.startTime)
  if (service.earliestTime && startMin < toMinutes(service.earliestTime)) return { ok: false, error: `The earliest start time is ${service.earliestTime}.` }
  if (service.latestTime && startMin + duration > toMinutes(service.latestTime)) return { ok: false, error: `Bookings must finish by ${service.latestTime}.` }

  const venue = input.venue && ['home', 'mandir', 'main-hall', 'sports-hall', 'kitchen'].includes(input.venue) ? input.venue : service.location === 'either' ? 'mandir' : (service.location ?? 'mandir')
  if (service.capacity) {
    // Classes and meals: places per session, rather than exclusive use of the room
    const session = await payload.find({
      collection: 'bookings',
      where: { and: [{ service: { equals: service.id } }, { startsAt: { equals: start.toISOString() } }, { status: { in: ['pending-approval', 'awaiting-payment', 'confirmed'] } }] },
      limit: 500,
      depth: 0,
      overrideAccess: true,
      select: { quantity: true },
    })
    const taken = session.docs.reduce((s, b) => s + (b.quantity ?? 1), 0)
    const d = decideCapacity({ capacity: service.capacity, placesTaken: taken, requested: input.quantity ?? 1, waitlistEnabled: false })
    if (d.outcome !== 'book') return { ok: false, error: d.outcome === 'invalid' ? d.reason : 'Sorry, that session is full. Please choose another date.' }
  } else if (venue !== 'home') {
    const busy = await getBusyIntervals(payload, venue, new Date(start.getTime() - 864e5), new Date(end.getTime() + 864e5))
    if (!isSlotFree({ start, end }, busy)) return { ok: false, error: 'That time is already booked. Please choose another slot.' }
  }

  const member = isActiveMember(input.member) ? input.member! : null
  const quantity = Math.max(1, Math.min(input.quantity ?? 1, 20))
  const hours = service.priceUnit === 'per hour' ? Math.ceil(duration / 60) : 1
  const extras = input.includeMaterials && service.materialsPrice ? service.materialsPrice : 0
  const amount = priceFor({ isMember: Boolean(member), memberPrice: service.memberPrice, guestPrice: service.nonMemberPrice, quantity: quantity * hours, extrasPence: extras })
  const status = service.requiresApproval ? 'pending-approval' : amount > 0 ? 'awaiting-payment' : 'confirmed'

  const booking = await payload.create({
    collection: 'bookings',
    data: {
      reference: makeReference('B'),
      kind: 'service',
      service: service.id,
      itemTitle: service.name,
      member: input.member?.id,
      name: input.name,
      email: input.email,
      phone: input.phone,
      date: start.toISOString(),
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      quantity,
      includeMaterials: Boolean(extras),
      venue,
      blocksVenue: !service.capacity && venue !== 'home',
      notes: input.notes,
      dietaryNotes: input.dietaryNotes,
      policyAgreedAt: input.policyAgreed ? new Date().toISOString() : undefined,
      amount,
      deposit: service.deposit ?? 0,
      isMemberPrice: Boolean(member),
      status,
    },
    overrideAccess: true,
    context: { skipBookingHooks: true },
  })

  if (status === 'pending-approval') {
    await sendTemplate(payload, {
      to: booking.email,
      template: 'booking-received',
      data: { name: booking.name, service: service.name, reference: booking.reference, date: ukDate(start), time: `${ukTime(start)}–${ukTime(end)}`, amount: amount ? formatGBP(amount) : 'Free' },
    })
  } else if (status === 'confirmed') {
    await sendConfirmation(payload, booking, service.name)
    if (service.writesToCalendar) await syncBookingToCalendar(payload, booking, service.name)
  }
  return { ok: true, value: { booking, needsPayment: status === 'awaiting-payment' } }
}

async function sendConfirmation(payload: Payload, booking: Booking, title: string, location?: string) {
  const start = booking.startsAt ? new Date(booking.startsAt) : null
  const end = booking.endsAt ? new Date(booking.endsAt) : null
  await sendTemplate(payload, {
    to: booking.email,
    template: 'booking-confirmed',
    data: {
      name: booking.name,
      reference: booking.reference,
      service: title,
      date: start ? ukDate(start) : '',
      time: start && end ? `${ukTime(start)}–${ukTime(end)}` : '',
      quantity: booking.quantity,
      amount: booking.amountPaid ? formatGBP(booking.amountPaid) : booking.amount ? formatGBP(booking.amount) : 'Free',
      calendarUrl: start && end ? googleCalendarUrl({ uid: booking.reference, title, start, end, location: location ?? 'Bharat Hindu Samaj, Rock Road, Peterborough PE1 3BU' }) : undefined,
      accountUrl: bookingLink(booking.reference, 'manage'),
    },
  })
}

async function syncBookingToCalendar(payload: Payload, booking: Booking, title: string, req?: PayloadRequest) {
  if (!booking.startsAt || !booking.endsAt) return
  const id = await writeToMasterCalendar(
    payload,
    { title: `${title} — ${booking.name} (${booking.reference})`, start: new Date(booking.startsAt), end: new Date(booking.endsAt), location: booking.venue ?? undefined },
    booking.googleEventId,
  )
  if (id && id !== booking.googleEventId) {
    await payload.update({ collection: 'bookings', id: booking.id, data: { googleEventId: id }, overrideAccess: true, context: { skipBookingHooks: true }, req })
  }
}

export async function confirmBookingAfterPayment(payload: Payload, booking: Booking, info: { provider: string; providerId?: string }) {
  const updated = await payload.update({
    collection: 'bookings',
    id: booking.id,
    data: { status: 'confirmed', amountPaid: booking.amount, paymentProvider: info.provider, paymentId: info.providerId },
    overrideAccess: true,
    context: { skipBookingHooks: true },
  })
  const payments = await payload.find({ collection: 'payments', where: { booking: { equals: booking.id } }, limit: 1, overrideAccess: true })
  if (payments.docs[0]) {
    await payload.update({ collection: 'payments', id: payments.docs[0].id, data: { status: 'paid', paidAt: new Date().toISOString(), provider: info.provider, providerId: info.providerId }, overrideAccess: true })
  }
  const service = updated.kind === 'service' && updated.service ? (typeof updated.service === 'object' ? updated.service : await payload.findByID({ collection: 'services', id: updated.service, overrideAccess: true })) : null
  const event = updated.kind === 'event' && updated.event ? (typeof updated.event === 'object' ? updated.event : await payload.findByID({ collection: 'events', id: updated.event, overrideAccess: true })) : null
  await sendConfirmation(payload, updated, updated.itemTitle ?? service?.name ?? event?.title ?? 'Booking', event?.location ?? undefined)
  if (service?.writesToCalendar) await syncBookingToCalendar(payload, updated, service.name)
}

/** Ensures a pending payment row exists for a booking and returns its receipt number. */
export async function ensureBookingPayment(payload: Payload, booking: Booking): Promise<string> {
  const existing = await payload.find({ collection: 'payments', where: { booking: { equals: booking.id } }, limit: 1, overrideAccess: true })
  if (existing.docs[0]) return existing.docs[0].receiptNumber
  const receiptNumber = makeReference('R')
  await payload.create({
    collection: 'payments',
    data: {
      receiptNumber,
      purpose: 'booking',
      status: 'pending',
      amount: booking.amount ?? 0,
      booking: booking.id,
      member: typeof booking.member === 'object' ? booking.member?.id : booking.member,
      payerName: booking.name,
      payerEmail: booking.email,
      description: booking.itemTitle ?? 'Booking',
    },
    overrideAccess: true,
  })
  return receiptNumber
}

/** Side effects when staff change a booking's status in the CMS (approve, reject, cancel). */
export async function onBookingStatusChange(payload: Payload, doc: Booking, previous: Booking | undefined, req: PayloadRequest) {
  if (!previous || previous.status === doc.status) return
  const title = doc.itemTitle ?? 'your booking'
  const service = doc.kind === 'service' && doc.service ? (typeof doc.service === 'object' ? doc.service : await payload.findByID({ collection: 'services', id: doc.service, overrideAccess: true, req })) : null

  if (previous.status === 'pending-approval' && doc.status === 'awaiting-payment') {
    await sendTemplate(payload, {
      to: doc.email,
      template: 'booking-confirmed',
      data: {
        name: doc.name,
        reference: doc.reference,
        service: `${title} (approved — payment due)`,
        date: doc.startsAt ? ukDate(doc.startsAt) : '',
        time: doc.startsAt && doc.endsAt ? `${ukTime(doc.startsAt)}–${ukTime(doc.endsAt)}` : '',
        quantity: doc.quantity,
        amount: formatGBP(doc.amount ?? 0),
        accountUrl: bookingLink(doc.reference, 'pay'),
      },
    })
  } else if (doc.status === 'confirmed') {
    await sendConfirmation(payload, doc, title)
    if (service?.writesToCalendar) await syncBookingToCalendar(payload, doc, service.name, req)
  } else if (doc.status === 'rejected') {
    await sendTemplate(payload, { to: doc.email, template: 'booking-rejected', data: { name: doc.name, reference: doc.reference, service: title, date: doc.startsAt ? ukDate(doc.startsAt) : '', note: doc.staffNote } })
  } else if (doc.status === 'cancelled') {
    await removeFromMasterCalendar(payload, doc.googleEventId)
    if (doc.kind === 'event' && doc.event) await promoteWaitlist(payload, typeof doc.event === 'object' ? doc.event.id : doc.event)
  }
}

/** Offer freed places to the earliest waitlisted booking. */
export async function promoteWaitlist(payload: Payload, eventId: number | string) {
  const event = await payload.findByID({ collection: 'events', id: eventId, overrideAccess: true, depth: 0 })
  const taken = await placesTaken(payload, eventId)
  const waiting = await payload.find({ collection: 'bookings', where: { and: [{ event: { equals: eventId } }, { status: { equals: 'waitlisted' } }] }, sort: 'createdAt', limit: 20, overrideAccess: true, depth: 0 })
  let used = taken
  for (const w of waiting.docs) {
    const d = decideCapacity({ capacity: event.capacity, placesTaken: used, requested: w.quantity ?? 1, waitlistEnabled: false })
    if (d.outcome !== 'book') break
    used += w.quantity ?? 1
    const status = (w.amount ?? 0) > 0 ? 'awaiting-payment' : 'confirmed'
    const updated = await payload.update({ collection: 'bookings', id: w.id, data: { status }, overrideAccess: true, context: { skipBookingHooks: true } })
    if (status === 'confirmed') await sendConfirmation(payload, updated, event.title, event.location ?? undefined)
    else
      await sendTemplate(payload, {
        to: w.email,
        template: 'booking-confirmed',
        data: { name: w.name, reference: w.reference, service: `${event.title} — a place is now available`, date: ukDate(event.startsAt), quantity: w.quantity, amount: formatGBP(w.amount ?? 0), accountUrl: bookingLink(w.reference, 'pay') },
      })
  }
}

/** Member or booker cancels under the stated rules (FR-37). */
export async function cancelBooking(payload: Payload, booking: Booking, now = new Date()): Promise<Result<{ refund: number }>> {
  if (!['pending-approval', 'awaiting-payment', 'confirmed', 'waitlisted'].includes(booking.status)) {
    return { ok: false, error: 'This booking cannot be cancelled.' }
  }
  const service = booking.kind === 'service' && booking.service ? (typeof booking.service === 'object' ? booking.service : await payload.findByID({ collection: 'services', id: booking.service, overrideAccess: true })) : null
  const event = booking.kind === 'event' && booking.event ? (typeof booking.event === 'object' ? booking.event : await payload.findByID({ collection: 'events', id: booking.event, overrideAccess: true })) : null
  const rule = service
    ? { fullRefundHours: service.cancellation?.fullRefundHours ?? 72, lateRefundPercent: service.cancellation?.lateRefundPercent ?? 0, depositRefundable: service.cancellation?.depositRefundable ?? false }
    : { fullRefundHours: event?.cancellationHours ?? 48, lateRefundPercent: 0, depositRefundable: true }
  const startsAt = booking.startsAt ? new Date(booking.startsAt) : new Date(now.getTime() + 365 * 864e5)
  const decision = decideRefund({ rule, amountPaid: booking.amountPaid ?? 0, depositPaid: booking.deposit ?? 0, startsAt, now })
  if (!decision.canCancel) return { ok: false, error: decision.reason }

  if (decision.refund > 0) {
    const r = await refundPayment(booking.paymentProvider, booking.paymentId, decision.refund)
    if (!r.ok) return { ok: false, error: `Refund could not be processed automatically (${r.error}). The office has been notified.` }
  }
  await payload.update({
    collection: 'bookings',
    id: booking.id,
    data: { status: decision.refund > 0 ? 'refunded' : 'cancelled', refunded: decision.refund },
    overrideAccess: true,
    context: { skipBookingHooks: true },
  })
  await removeFromMasterCalendar(payload, booking.googleEventId)
  if (event) await promoteWaitlist(payload, event.id)
  await sendTemplate(payload, {
    to: booking.email,
    template: 'booking-cancelled',
    data: { name: booking.name, reference: booking.reference, service: booking.itemTitle, refund: decision.refund ? formatGBP(decision.refund) : 'None', reason: decision.reason },
  })
  return { ok: true, value: { refund: decision.refund } }
}
