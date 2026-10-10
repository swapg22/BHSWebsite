import type { Metadata } from 'next'
import { requireStaff } from '@/lib/staffAuth'
import { getPayloadClient } from '@/lib/data'
import { getDashboardStats } from '@/lib/reports'
import { formatGBP } from '@/lib/money'
import { hasRole } from '@/access/roles'

export const metadata: Metadata = { title: 'Reports', robots: { index: false } }
export const dynamic = 'force-dynamic'

/** Dashboard and CSV exports (FR-46), HMRC Gift Aid schedule (FR-20). */
export default async function ReportsPage() {
  const user = await requireStaff('administrator', 'treasurer', 'membership-officer')
  const payload = await getPayloadClient()
  const s = await getDashboardStats(payload)
  const finance = hasRole(user, 'administrator', 'treasurer')
  const year = new Date().getUTCFullYear()
  const exports = [
    finance && { href: '/exports/gift-aid', label: 'HMRC Gift Aid schedule (CSV)', text: 'Eligible, unclaimed personal gifts in the Charities Online column order. The treasurer must review the first export before any claim.' },
    finance && { href: '/exports/donations', label: 'All donations (CSV)', text: 'Every gift with fund, method, Gift Aid status and campaign code.' },
    finance && { href: '/exports/payments', label: 'Membership and booking payments (CSV)', text: 'Receipts for the treasurer’s reconciliation.' },
    { href: '/exports/members', label: 'Members (CSV)', text: 'The member database with status, renewal dates and consents.' },
    { href: '/exports/bookings', label: 'Bookings (CSV)', text: 'All bookings with status and amounts.' },
  ].filter(Boolean) as { href: string; label: string; text: string }[]
  return (
    <div className="container-page py-12">
      <p className="eyebrow">Staff tools</p>
      <h1 className="mt-2 text-4xl">Reports and exports</h1>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Appeal raised', `${formatGBP(s.appealRaised)} of ${formatGBP(s.appealTarget)}`],
          ['Gifts this month', `${formatGBP(s.giftsThisMonth)} (${s.giftsThisMonthCount})`],
          ['Active members', `${s.activeMembers} (${s.dueSoon} due soon)`],
          ['Bookings to approve', String(s.pendingBookings)],
        ].map(([k, v]) => (
          <div key={k} className="card p-5"><dt className="text-sm text-charcoal-500">{k}</dt><dd className="mt-1 text-xl font-semibold">{v}</dd></div>
        ))}
      </dl>
      <ul className="mt-10 grid gap-4 md:grid-cols-2">
        {exports.map((e) => (
          <li key={e.href} className="card p-6">
            <h2 className="font-serif text-2xl">{e.label}</h2>
            <p className="mt-1 text-charcoal-600">{e.text}</p>
            <form action={e.href} method="get" className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="field-label" htmlFor={`${e.href}-from`}>From</label>
                <input id={`${e.href}-from`} name="from" type="date" defaultValue={`${year - 1}-04-06`} className="field-input" />
              </div>
              <div>
                <label className="field-label" htmlFor={`${e.href}-to`}>To</label>
                <input id={`${e.href}-to`} name="to" type="date" className="field-input" />
              </div>
              <button className="min-h-12 cursor-pointer rounded-full bg-saffron-700 px-5 font-semibold text-white hover:bg-saffron-800">Download</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  )
}
