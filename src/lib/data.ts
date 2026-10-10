import { cache } from 'react'
import { headers } from 'next/headers'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import type { Media, Member } from '@/payload-types'
import { resolveTimes, DEFAULT_TIMES } from '@/lib/openingTimes'

export const getPayloadClient = cache(async (): Promise<Payload> => getPayload({ config }))

export const getSettings = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
})

export const getTimes = cache(async () => {
  const s = await getSettings()
  return resolveTimes({
    standard: {
      weekdays: s.standardTimes?.weekdays || DEFAULT_TIMES.weekdays,
      weekends: s.standardTimes?.weekends || DEFAULT_TIMES.weekends,
      aarti: s.standardTimes?.aarti || DEFAULT_TIMES.aarti,
      note: s.standardTimes?.note,
    },
    overrides: (s.seasonalOverrides ?? []).map((o) => ({
      label: o.label,
      startDate: o.startDate,
      endDate: o.endDate,
      weekdays: o.weekdays ?? undefined,
      weekends: o.weekends ?? undefined,
      aarti: o.aarti ?? undefined,
      note: o.note,
    })),
  })
})

export const getAppeal = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'appeal', depth: 1 })
})

export const getHome = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'home-page', depth: 1 })
})

export const getGovernance = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'governance', depth: 1 })
})

/** The signed-in member (or null). Staff sessions are ignored on the public site. */
export const getCurrentMember = cache(async (): Promise<Member | null> => {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || user.collection !== 'members') return null
  return user as Member & { collection: 'members' }
})

export const getCurrentStaff = cache(async () => {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })
  if (!user || user.collection !== 'users') return null
  return user
})

export function mediaUrl(m: Media | number | null | undefined, size?: 'thumb' | 'card' | 'hero'): string | null {
  if (!m || typeof m === 'number') return null
  const sized = size ? m.sizes?.[size]?.url : null
  const url = sized || m.url || null
  // Payload returns absolute URLs when serverURL is set; serve our own uploads as relative paths
  return url ? url.replace(/^https?:\/\/[^/]+(?=\/api\/media\/)/, '') : null
}

export function mediaAlt(m: Media | number | null | undefined, fallback = ''): string {
  if (!m || typeof m === 'number') return fallback
  return m.alt || fallback
}

export async function getUpcomingEvents(limit = 6, opts: { featuredOnly?: boolean; category?: string } = {}) {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'events',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { endsAt: { greater_than: new Date().toISOString() } },
        // Daily aarti and weekly classes live on the calendar, not in "coming up" lists
        { recurrence: { equals: 'none' } },
        ...(opts.featuredOnly ? [{ featured: { equals: true } }] : []),
        ...(opts.category ? [{ category: { equals: opts.category } }] : []),
      ],
    },
    sort: 'startsAt',
    limit,
    depth: 1,
  })
  return res.docs
}
