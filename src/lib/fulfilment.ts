import type { Payload } from 'payload'
import { sendTemplate } from '@/lib/email'
import { formatGBP } from '@/lib/money'
import { formatMembershipNumber, nextExpiry } from '@/lib/membership'
import { createToken } from '@/lib/signing'
import { siteUrl } from '@/lib/payments'
import { FUND_LABELS } from '@/lib/labels'
import { confirmBookingAfterPayment } from '@/lib/bookingService'

/**
 * Applies a successful payment. Every function is idempotent: Stripe/GoCardless webhooks
 * and the demo checkout may deliver the same event more than once.
 */

const ukDate = (d: Date | string) =>
  new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'Europe/London' }).format(new Date(d))

export function receiptUrl(reference: string): string {
  const token = createToken({ ref: reference }, 60 * 60 * 24 * 365)
  return `${siteUrl()}/receipt/${reference}?t=${encodeURIComponent(token)}`
}

export async function fulfilDonation(
  payload: Payload,
  reference: string,
  info: { provider: string; providerId?: string; subscriptionId?: string },
): Promise<'applied' | 'already' | 'missing'> {
  const { docs } = await payload.find({ collection: 'donations', where: { reference: { equals: reference } }, limit: 1, overrideAccess: true })
  const d = docs[0]
  if (!d) return 'missing'
  if (d.status === 'paid' || d.status === 'active') return 'already'
  const recurring = d.frequency === 'monthly'
  await payload.update({
    collection: 'donations',
    id: d.id,
    data: {
      status: recurring ? 'active' : 'paid',
      paidAt: new Date().toISOString(),
      provider: info.provider,
      providerId: info.providerId ?? d.providerId,
      providerSubscriptionId: info.subscriptionId ?? d.providerSubscriptionId,
    },
    overrideAccess: true,
  })
  if (d.sponsorship) {
    const itemId = typeof d.sponsorship === 'object' ? d.sponsorship.id : d.sponsorship
    const item = await payload.findByID({ collection: 'sponsorship-items', id: itemId, overrideAccess: true })
    await payload.update({
      collection: 'sponsorship-items',
      id: itemId,
      data: { sponsoredCount: (item.sponsoredCount ?? 0) + 1 },
      overrideAccess: true,
    })
  }
  await sendTemplate(payload, {
    to: d.email,
    template: 'donation-receipt',
    data: {
      name: d.firstName,
      reference: d.reference,
      amount: formatGBP(d.amount),
      frequency: recurring ? 'Monthly' : 'One-off',
      fund: d.fund,
      fundLabel: FUND_LABELS[d.fund as keyof typeof FUND_LABELS] ?? d.fund,
      giftAid: d.giftAidEligible ? `Yes, adds ${formatGBP(Math.floor(d.amount * 0.25))} at no cost to you` : 'No',
      date: ukDate(new Date()),
      receiptUrl: receiptUrl(d.reference),
    },
  })
  return 'applied'
}

/** Each later monthly collection is recorded as its own gift, so Gift Aid can be claimed per payment. */
export async function recordRecurringPayment(
  payload: Payload,
  parentReference: string,
  info: { provider: string; providerId: string; amountPence?: number; paidAt?: Date },
): Promise<'applied' | 'already' | 'missing'> {
  const dup = await payload.find({ collection: 'donations', where: { providerId: { equals: info.providerId } }, limit: 1, overrideAccess: true })
  if (dup.docs.length) return 'already'
  const { docs } = await payload.find({ collection: 'donations', where: { reference: { equals: parentReference } }, limit: 1, overrideAccess: true })
  const parent = docs[0]
  if (!parent) return 'missing'
  const { makeReference } = await import('@/lib/reference')
  const { id: _id, createdAt: _c, updatedAt: _u, reference: _r, ...rest } = parent
  await payload.create({
    collection: 'donations',
    data: {
      ...rest,
      reference: makeReference('D'),
      amount: info.amountPence ?? parent.amount,
      status: 'paid',
      paidAt: (info.paidAt ?? new Date()).toISOString(),
      provider: info.provider,
      providerId: info.providerId,
      campaign: `recurring:${parent.reference}`,
      sponsorship: null,
    },
    overrideAccess: true,
  })
  return 'applied'
}

export async function fulfilMembership(
  payload: Payload,
  receiptNumber: string,
  info: { provider: string; providerId?: string },
): Promise<'applied' | 'already' | 'missing'> {
  const { docs } = await payload.find({ collection: 'payments', where: { receiptNumber: { equals: receiptNumber } }, limit: 1, overrideAccess: true, depth: 0 })
  const p = docs[0]
  if (!p || !p.member) return 'missing'
  if (p.status === 'paid') return 'already'
  const paidAt = new Date()
  await payload.update({
    collection: 'payments',
    id: p.id,
    data: { status: 'paid', paidAt: paidAt.toISOString(), provider: info.provider, providerId: info.providerId },
    overrideAccess: true,
  })
  const memberId = typeof p.member === 'object' ? p.member.id : p.member
  const member = await payload.findByID({ collection: 'members', id: memberId, overrideAccess: true })
  let membershipNumber = member.membershipNumber
  if (!membershipNumber) {
    const latest = await payload.find({ collection: 'members', where: { membershipNumber: { like: 'BHS' } }, sort: '-membershipNumber', limit: 1, overrideAccess: true, depth: 0 })
    const lastNum = Number(String(latest.docs[0]?.membershipNumber ?? 'BHS10000').replace(/\D/g, '')) || 10000
    membershipNumber = formatMembershipNumber(lastNum + 1)
  }
  const expiry = nextExpiry(paidAt, member.expiryDate ? new Date(member.expiryDate) : null)
  await payload.update({
    collection: 'members',
    id: memberId,
    data: {
      membershipNumber,
      status: 'active',
      lastPaidDate: paidAt.toISOString(),
      expiryDate: expiry.toISOString(),
      memberSince: member.memberSince ?? paidAt.toISOString(),
      receiptNumber,
      paymentReference: info.providerId ?? receiptNumber,
      remindersSent: [],
    },
    overrideAccess: true,
  })
  await sendTemplate(payload, {
    to: member.email,
    template: 'membership-confirmed',
    data: {
      name: member.firstName,
      membershipNumber,
      expiry: ukDate(expiry),
      amount: formatGBP(p.amount),
      receiptNumber,
      accountUrl: `${siteUrl()}/account`,
    },
  })
  return 'applied'
}

export async function fulfilBooking(
  payload: Payload,
  reference: string,
  info: { provider: string; providerId?: string },
): Promise<'applied' | 'already' | 'missing'> {
  const { docs } = await payload.find({ collection: 'bookings', where: { reference: { equals: reference } }, limit: 1, overrideAccess: true, depth: 1 })
  const b = docs[0]
  if (!b) return 'missing'
  if (b.status === 'confirmed' && (b.amountPaid ?? 0) >= (b.amount ?? 0)) return 'already'
  await confirmBookingAfterPayment(payload, b, info)
  return 'applied'
}

export async function fulfilByPurpose(
  payload: Payload,
  purpose: string,
  reference: string,
  info: { provider: string; providerId?: string; subscriptionId?: string },
) {
  if (purpose === 'donation') return fulfilDonation(payload, reference, info)
  if (purpose === 'membership') return fulfilMembership(payload, reference, info)
  if (purpose === 'booking') return fulfilBooking(payload, reference, info)
  return 'missing' as const
}

export async function markPaymentFailed(payload: Payload, purpose: string, reference: string) {
  if (purpose === 'donation') {
    const { docs } = await payload.find({ collection: 'donations', where: { reference: { equals: reference } }, limit: 1, overrideAccess: true })
    if (docs[0] && docs[0].status === 'pending') {
      await payload.update({ collection: 'donations', id: docs[0].id, data: { status: 'failed' }, overrideAccess: true })
    }
  } else if (purpose === 'membership') {
    const { docs } = await payload.find({ collection: 'payments', where: { receiptNumber: { equals: reference } }, limit: 1, overrideAccess: true })
    if (docs[0] && docs[0].status === 'pending') {
      await payload.update({ collection: 'payments', id: docs[0].id, data: { status: 'failed' }, overrideAccess: true })
    }
  }
}
