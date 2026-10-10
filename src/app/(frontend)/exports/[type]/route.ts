import { headers } from 'next/headers'
import type { Where } from 'payload'
import { getPayloadClient } from '@/lib/data'
import { hasRole, isStaff, type StaffRole } from '@/access/roles'
import { csvResponse, toCSV } from '@/lib/csv'
import { findAll } from '@/lib/reports'
import { buildHmrcScheduleRows, HMRC_SCHEDULE_HEADER } from '@/lib/giftaid'
import type { Booking, Donation, Member, Payment } from '@/payload-types'

const ROLES: Record<string, StaffRole[]> = {
  'gift-aid': ['administrator', 'treasurer'],
  donations: ['administrator', 'treasurer'],
  payments: ['administrator', 'treasurer'],
  members: ['administrator', 'membership-officer', 'treasurer'],
  bookings: ['administrator', 'membership-officer', 'treasurer'],
}

const pounds = (p?: number | null) => ((p ?? 0) / 100).toFixed(2)
const day = (d?: string | null) => (d ? d.slice(0, 10) : '')

/** Treasurer and membership CSV exports (FR-46). Access is checked on every request and audited. */
export async function GET(req: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!ROLES[type]) return new Response('Not found', { status: 404 })
  if (!user || !isStaff(user) || !hasRole(user, ...ROLES[type])) return new Response('Forbidden', { status: 403 })

  const url = new URL(req.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const range = (field: string): Where[] => [
    ...(from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? [{ [field]: { greater_than_equal: `${from}T00:00:00.000Z` } }] : []),
    ...(to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? [{ [field]: { less_than_equal: `${to}T23:59:59.999Z` } }] : []),
  ]

  await payload.create({
    collection: 'audit-log',
    data: { actorEmail: user.email, actorType: 'staff', action: 'export', entity: type, entityId: '-', summary: `${type} export ${from ?? ''}–${to ?? ''}` },
    overrideAccess: true,
  })
  const stamp = new Date().toISOString().slice(0, 10)

  if (type === 'gift-aid') {
    const gifts = await findAll<Donation>(payload, 'donations', {
      and: [{ giftAidEligible: { equals: true } }, { status: { in: ['paid', 'active'] } }, { currency: { equals: 'GBP' } }, { or: [{ 'giftAid.claimedInBatch': { exists: false } }, { 'giftAid.claimedInBatch': { equals: '' } }] }, ...range('paidAt')],
    })
    const rows = buildHmrcScheduleRows(
      gifts.map((g) => ({
        title: g.title,
        firstName: g.firstName,
        lastName: g.lastName,
        houseNameOrNumber: g.houseNameOrNumber ?? '',
        postcode: g.postcode ?? '',
        isOverseas: g.country !== 'United Kingdom',
        donationDate: g.paidAt ?? g.createdAt,
        amountPence: g.amount,
      })),
    )
    return csvResponse(`gift-aid-schedule-${stamp}.csv`, toCSV(rows, HMRC_SCHEDULE_HEADER))
  }
  if (type === 'donations') {
    const gifts = await findAll<Donation>(payload, 'donations', range('createdAt').length ? { and: range('createdAt') } : undefined)
    return csvResponse(
      `donations-${stamp}.csv`,
      toCSV(
        gifts.map((g) => [g.reference, day(g.createdAt), day(g.paidAt), g.status, g.donorName, g.email, g.company, pounds(g.amount), g.currency, g.frequency, g.method, g.fund, g.source, g.giftAidEligible ? 'Yes' : 'No', g.giftAidReason, g.houseNameOrNumber, g.postcode, g.campaign, g.provider, g.providerId]),
        ['Reference', 'Created', 'Paid', 'Status', 'Donor', 'Email', 'Company', 'Amount', 'Currency', 'Frequency', 'Method', 'Fund', 'Source', 'Gift Aid eligible', 'Gift Aid reason', 'House', 'Postcode', 'Campaign', 'Provider', 'Provider ID'],
      ),
    )
  }
  if (type === 'payments') {
    const rows = await findAll<Payment>(payload, 'payments', range('createdAt').length ? { and: range('createdAt') } : undefined)
    return csvResponse(`payments-${stamp}.csv`, toCSV(rows.map((p) => [p.receiptNumber, p.purpose, p.status, day(p.paidAt), p.payerName, p.payerEmail, p.description, pounds(p.amount), pounds(p.refundedAmount), p.provider, p.providerId]), ['Receipt', 'Purpose', 'Status', 'Paid', 'Payer', 'Email', 'Description', 'Amount', 'Refunded', 'Provider', 'Provider ID']))
  }
  if (type === 'members') {
    const rows = await findAll<Member>(payload, 'members')
    return csvResponse(
      `members-${stamp}.csv`,
      toCSV(
        rows.map((m) => [m.membershipNumber, m.firstName, m.lastName, m.email, m.phone, [m.addressLine1, m.addressLine2, m.town].filter(Boolean).join(', ') || m.legacyAddress, m.postcode, m.status, day(m.memberSince), day(m.lastPaidDate), day(m.expiryDate), m.receiptNumber, m.consents?.newsletter ? 'Yes' : 'No', m.giftAid?.declared ? 'Yes' : 'No', m.autoRenew ? 'Yes' : 'No']),
        ['Membership number', 'First name', 'Last name', 'Email', 'Phone', 'Address', 'Postcode', 'Status', 'Member since', 'Last paid', 'Expiry', 'Receipt number', 'Newsletter', 'Gift Aid', 'Auto-renew'],
      ),
    )
  }
  const rows = await findAll<Booking>(payload, 'bookings', range('startsAt').length ? { and: range('startsAt') } : undefined)
  return csvResponse(
    `bookings-${stamp}.csv`,
    toCSV(rows.map((b) => [b.reference, b.itemTitle, b.status, b.startsAt, b.name, b.email, b.phone, b.quantity, pounds(b.amount), pounds(b.amountPaid), pounds(b.refunded), b.attended ? 'Yes' : 'No', b.dietaryNotes]), ['Reference', 'Item', 'Status', 'Starts', 'Name', 'Email', 'Phone', 'Places', 'Amount', 'Paid', 'Refunded', 'Attended', 'Dietary notes']),
  )
}
