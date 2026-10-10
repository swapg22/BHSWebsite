import { getCurrentMember, getPayloadClient } from '@/lib/data'

/** Member data export (NFR-04, UK GDPR right of access). Committee notes are excluded by field access. */
export async function GET() {
  const member = await getCurrentMember()
  if (!member) return new Response('Please sign in', { status: 401 })
  const payload = await getPayloadClient()
  const opts = { user: member, overrideAccess: false, depth: 0, limit: 500 } as const
  const [profile, bookings, donations, payments] = await Promise.all([
    payload.findByID({ collection: 'members', id: member.id, user: member, overrideAccess: false, depth: 0 }),
    payload.find({ collection: 'bookings', where: { member: { equals: member.id } }, ...opts }),
    payload.find({ collection: 'donations', where: { member: { equals: member.id } }, ...opts }),
    payload.find({ collection: 'payments', where: { member: { equals: member.id } }, ...opts }),
  ])
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), profile, bookings: bookings.docs, donations: donations.docs, payments: payments.docs }, null, 2)
  return new Response(body, {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="my-bharat-hindu-samaj-data.json"', 'Cache-Control': 'no-store' },
  })
}
