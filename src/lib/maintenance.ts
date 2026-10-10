import type { Payload } from 'payload'
import type { Member } from '@/payload-types'
import { findAll } from '@/lib/reports'
import { membershipStatus, reminderDue } from '@/lib/membership'
import { sendTemplate } from '@/lib/email'
import { siteUrl } from '@/lib/payments'

const ukDate = (d: Date) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(d)

/** Renewal reminders 30 and 7 days before, and on expiry; lapses members after the grace period (FR-30). */
export async function runRenewalReminders(payload: Payload, now = new Date()) {
  const members = await findAll<Member>(payload, 'members', { and: [{ status: { equals: 'active' } }, { expiryDate: { exists: true } }] })
  let reminded = 0
  let lapsed = 0
  for (const m of members) {
    const expiry = new Date(m.expiryDate!)
    if (membershipStatus(expiry, now) === 'lapsed') {
      await payload.update({ collection: 'members', id: m.id, data: { status: 'lapsed' }, overrideAccess: true })
      lapsed++
      continue
    }
    if (m.autoRenew && m.stripeCustomerId) continue // Stripe renews these automatically
    const sent = Array.isArray(m.remindersSent) ? (m.remindersSent as number[]) : []
    const due = reminderDue(expiry, now, sent)
    if (due === null) continue
    await sendTemplate(payload, { to: m.email, template: 'renewal-reminder', data: { name: m.firstName, days: due, expiry: ukDate(expiry), renewUrl: `${siteUrl()}/account` } })
    await payload.update({ collection: 'members', id: m.id, data: { remindersSent: [...sent, due] }, overrideAccess: true, context: { skipAudit: true } })
    reminded++
  }
  return { reminded, lapsed }
}

/** Empties the bin: trashed events, news, albums, pages and media older than 30 days (spec section 8). */
export async function purgeTrash(payload: Payload, now = new Date()) {
  const cutoff = new Date(now.getTime() - 30 * 864e5).toISOString()
  let purged = 0
  for (const collection of ['events', 'news', 'albums', 'pages', 'media'] as const) {
    const res = await payload.delete({ collection, where: { deletedAt: { less_than: cutoff } }, trash: true, overrideAccess: true })
    purged += res.docs.length
  }
  return { purged }
}
