import type { Payload, Where } from 'payload'

/** Paginates through a collection with access control bypassed; for server-side reports only. */
export async function findAll<T = Record<string, unknown>>(payload: Payload, collection: Parameters<Payload['find']>[0]['collection'], where?: Where, depth = 0): Promise<T[]> {
  const out: T[] = []
  let page = 1
  for (;;) {
    const res = await payload.find({ collection, where, depth, limit: 500, page, overrideAccess: true, pagination: true })
    out.push(...(res.docs as T[]))
    if (!res.hasNextPage) break
    page++
  }
  return out
}

export async function getAppealTotals(payload: Payload): Promise<{ raised: number; target: number; donors: number }> {
  const appeal = await payload.findGlobal({ slug: 'appeal', overrideAccess: true })
  const gifts = await findAll<{ amount: number; email: string }>(payload, 'donations', {
    and: [{ fund: { equals: 'new-mandir' } }, { status: { in: ['paid', 'active'] } }, { currency: { equals: 'GBP' } }],
  })
  const online = gifts.reduce((s, g) => s + (g.amount ?? 0), 0)
  return {
    raised: online + (appeal.raisedOfflinePence ?? 0),
    target: appeal.targetPence ?? 120000000,
    donors: new Set(gifts.map((g) => g.email)).size,
  }
}

export async function getDashboardStats(payload: Payload) {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
  const in30 = new Date(now.getTime() + 30 * 864e5).toISOString()
  const [appeal, gifts, active, dueSoon, pending, upcoming, ...drafts] = await Promise.all([
    getAppealTotals(payload),
    findAll<{ amount: number; giftAidEligible: boolean }>(payload, 'donations', { and: [{ status: { in: ['paid', 'active'] } }, { paidAt: { greater_than_equal: monthStart } }] }),
    payload.count({ collection: 'members', where: { status: { equals: 'active' } }, overrideAccess: true }),
    payload.count({ collection: 'members', where: { and: [{ status: { equals: 'active' } }, { expiryDate: { less_than: in30 } }] }, overrideAccess: true }),
    payload.count({ collection: 'bookings', where: { status: { equals: 'pending-approval' } }, overrideAccess: true }),
    payload.count({ collection: 'bookings', where: { and: [{ status: { equals: 'confirmed' } }, { startsAt: { greater_than: now.toISOString() } }, { startsAt: { less_than: in30 } }] }, overrideAccess: true }),
    ...(['events', 'news', 'pages', 'albums'] as const).map((c) =>
      payload.count({ collection: c, where: { readyForReview: { equals: true } }, overrideAccess: true, draft: true } as Parameters<Payload['count']>[0]),
    ),
  ])
  return {
    appealRaised: appeal.raised,
    appealTarget: appeal.target,
    giftsThisMonth: gifts.reduce((s, g) => s + g.amount, 0),
    giftsThisMonthCount: gifts.length,
    giftAidEligibleCount: gifts.filter((g) => g.giftAidEligible).length,
    activeMembers: active.totalDocs,
    dueSoon: dueSoon.totalDocs,
    pendingBookings: pending.totalDocs,
    upcomingBookings: upcoming.totalDocs,
    readyForReview: drafts.reduce((s, d) => s + d.totalDocs, 0),
  }
}
