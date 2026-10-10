'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getCurrentMember, getPayloadClient } from '@/lib/data'
import { guardForm, zodErrors, formValues, type FormState } from '@/lib/formGuard'
import { cancelBooking, createEventBooking, createServiceBooking, ensureBookingPayment, bookingLink } from '@/lib/bookingService'
import { createCardCheckout, demoPaymentsAllowed, paymentsMode } from '@/lib/payments'
import { readToken } from '@/lib/signing'
import { fulfilByPurpose, markPaymentFailed } from '@/lib/fulfilment'
import type { Booking } from '@/payload-types'

const contact = {
  name: z.string().trim().min(2, 'Enter your name').max(120),
  email: z.email('Enter a valid email address').max(200),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
}

const eventSchema = z.object({
  eventId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1, 'Choose at least one place').max(20, 'For more than 20 places please contact the office'),
  dietaryNotes: z.string().trim().max(500).optional().or(z.literal('')),
  ...contact,
})

async function goToPayment(booking: Booking): Promise<never> {
  const payload = await getPayloadClient()
  const receipt = await ensureBookingPayment(payload, booking)
  const checkout = await createCardCheckout({
    purpose: 'booking',
    reference: booking.reference,
    amountPence: booking.amount ?? 0,
    description: `Booking: ${booking.itemTitle ?? 'Bharat Hindu Samaj'}`,
    customerEmail: booking.email,
    successPath: `/bookings/confirmed?ref=${booking.reference}`,
    cancelPath: bookingLink(booking.reference, 'pay').replace(/^https?:\/\/[^/]+/, ''),
  })
  await payload.update({ collection: 'bookings', id: booking.id, data: { paymentProvider: checkout.provider, paymentId: checkout.providerId }, overrideAccess: true, context: { skipBookingHooks: true } })
  void receipt
  redirect(checkout.url)
}

export async function bookEvent(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formValues(fd, ['name', 'email', 'phone', 'quantity', 'dietaryNotes'])
  const guard = await guardForm(fd, 'book-event', 10)
  if (!guard.ok) return { ok: false, message: guard.error, values }
  const parsed = eventSchema.safeParse(Object.fromEntries(fd))
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: zodErrors(parsed.error.issues), values }
  const payload = await getPayloadClient()
  const member = await getCurrentMember()
  const res = await createEventBooking(payload, { ...parsed.data, phone: parsed.data.phone || undefined, dietaryNotes: parsed.data.dietaryNotes || undefined, member })
  if (!res.ok) return { ok: false, message: res.error, values }
  if (res.value.needsPayment) await goToPayment(res.value.booking)
  redirect(`/bookings/confirmed?ref=${res.value.booking.reference}&status=${res.value.booking.status}`)
}

const serviceSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Choose a start time'),
  durationMinutes: z.coerce.number().int().min(30).max(720).optional(),
  quantity: z.coerce.number().int().min(1).max(20).optional(),
  venue: z.enum(['mandir', 'home', 'main-hall', 'sports-hall', 'kitchen']).optional(),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
  dietaryNotes: z.string().trim().max(500).optional().or(z.literal('')),
  ...contact,
})

export async function bookService(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = formValues(fd, ['name', 'email', 'phone', 'date', 'startTime', 'durationMinutes', 'quantity', 'venue', 'notes', 'dietaryNotes'])
  const guard = await guardForm(fd, 'book-service', 10)
  if (!guard.ok) return { ok: false, message: guard.error, values }
  const raw = Object.fromEntries([...fd.entries()].filter(([, v]) => v !== ''))
  const parsed = serviceSchema.safeParse(raw)
  if (!parsed.success) return { ok: false, message: 'Please check the highlighted fields.', errors: zodErrors(parsed.error.issues), values }
  const payload = await getPayloadClient()
  const member = await getCurrentMember()
  const res = await createServiceBooking(payload, {
    ...parsed.data,
    phone: parsed.data.phone || undefined,
    notes: parsed.data.notes || undefined,
    dietaryNotes: parsed.data.dietaryNotes || undefined,
    includeMaterials: fd.get('includeMaterials') === 'on',
    policyAgreed: fd.get('policyAgreed') === 'on',
    member,
  })
  if (!res.ok) return { ok: false, message: res.error, values }
  if (res.value.needsPayment) await goToPayment(res.value.booking)
  redirect(`/bookings/confirmed?ref=${res.value.booking.reference}&status=${res.value.booking.status}`)
}

/** Loads a booking the visitor may act on: their own (signed in) or via the signed link in their email. */
async function authorisedBooking(reference: string, token: string | null): Promise<Booking | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'bookings', where: { reference: { equals: reference } }, limit: 1, overrideAccess: true, depth: 1 })
  const booking = docs[0]
  if (!booking) return null
  const t = readToken<{ ref: string }>(token)
  if (t?.ref === reference) return booking
  const member = await getCurrentMember()
  const ownerId = typeof booking.member === 'object' ? booking.member?.id : booking.member
  if (member && ownerId === member.id) return booking
  return null
}

export async function payForBooking(fd: FormData): Promise<void> {
  const booking = await authorisedBooking(String(fd.get('reference')), String(fd.get('t') ?? ''))
  if (!booking || booking.status !== 'awaiting-payment') redirect('/account?error=booking')
  await goToPayment(booking)
}

export async function cancelMyBooking(_prev: FormState, fd: FormData): Promise<FormState> {
  const booking = await authorisedBooking(String(fd.get('reference')), String(fd.get('t') ?? ''))
  if (!booking) return { ok: false, message: 'We could not find that booking.' }
  if (fd.get('confirm') !== 'on') return { ok: false, message: 'Please tick the box to confirm you want to cancel.' }
  const payload = await getPayloadClient()
  const res = await cancelBooking(payload, booking)
  if (!res.ok) return { ok: false, message: res.error }
  return { ok: true, message: res.value.refund ? `Your booking has been cancelled and £${(res.value.refund / 100).toFixed(2)} will be refunded.` : 'Your booking has been cancelled.' }
}

/** Demo checkout (no payment keys configured): simulates the provider's success or failure callback. */
export async function completeDemoCheckout(fd: FormData): Promise<void> {
  const token = String(fd.get('token') ?? '')
  const outcome = String(fd.get('outcome') ?? '')
  const data = readToken<{ purpose: string; reference: string; successPath: string; cancelPath: string; method: string }>(token)
  if (!data) redirect('/?checkout=expired')
  // Never accept a simulated payment once a real provider is configured, or in production
  const realProvider = data.method === 'direct-debit' ? paymentsMode().directDebit !== 'demo' : paymentsMode().card !== 'demo'
  if (!demoPaymentsAllowed() || realProvider) redirect('/?checkout=unavailable')
  const payload = await getPayloadClient()
  if (outcome === 'success') {
    await fulfilByPurpose(payload, data.purpose, data.reference, { provider: 'demo', providerId: `demo_${data.reference}` })
    redirect(data.successPath)
  }
  if (outcome === 'fail') {
    await markPaymentFailed(payload, data.purpose, data.reference)
    redirect(`${data.cancelPath}${data.cancelPath.includes('?') ? '&' : '?'}failed=1`)
  }
  redirect(data.cancelPath)
}
