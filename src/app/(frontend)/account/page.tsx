import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentMember, getPayloadClient } from '@/lib/data'
import { membershipStatus } from '@/lib/membership'
import { formatGBP, formatMoney } from '@/lib/money'
import { BOOKING_STATUS_LABELS, FUND_LABELS } from '@/lib/labels'
import { logoutMember, renewMembership } from '@/app/(frontend)/actions/membership'
import { Badge, Notice } from '@/components/ui'
import { ProfileForm } from './ProfileForm'
import { DataRequest } from './DataRequest'

export const metadata: Metadata = { title: 'My account', robots: { index: false } }
export const dynamic = 'force-dynamic'

const d = (s?: string | null) => (s ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'Europe/London' }).format(new Date(s)) : '—')
const dt = (s?: string | null) => (s ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London' }).format(new Date(s)) : '')

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const member = await getCurrentMember()
  if (!member) redirect('/account/login?next=/account')
  const { reset } = await searchParams
  const payload = await getPayloadClient()
  const [bookings, donations, payments] = await Promise.all([
    payload.find({ collection: 'bookings', where: { member: { equals: member.id } }, sort: '-startsAt', limit: 50, depth: 0, user: member, overrideAccess: false }),
    payload.find({ collection: 'donations', where: { member: { equals: member.id } }, sort: '-createdAt', limit: 50, depth: 0, user: member, overrideAccess: false }),
    payload.find({ collection: 'payments', where: { and: [{ member: { equals: member.id } }, { status: { equals: 'paid' } }] }, sort: '-paidAt', limit: 50, depth: 0, user: member, overrideAccess: false }),
  ])
  const status = member.status === 'active' ? membershipStatus(member.expiryDate ? new Date(member.expiryDate) : null) : member.status === 'pending-payment' ? 'pending-payment' : 'lapsed'
  const statusLabel = { active: 'Active', 'due-soon': 'Due for renewal', grace: 'Expired — please renew', lapsed: 'Lapsed', 'pending-payment': 'Payment needed' }[status] ?? status
  const now = Date.now()
  const upcoming = bookings.docs.filter((b) => !b.startsAt || new Date(b.startsAt).getTime() > now)
  const past = bookings.docs.filter((b) => b.startsAt && new Date(b.startsAt).getTime() <= now)

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Namaste, {member.firstName}</h1>
        </div>
        <form action={logoutMember}><button className="min-h-11 cursor-pointer rounded-full border border-charcoal-400 px-5 font-semibold hover:bg-ivory-200">Sign out</button></form>
      </div>
      {reset && <div className="mt-6"><Notice tone="success">Your password has been changed.</Notice></div>}

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-1" aria-labelledby="mem-h">
          <h2 id="mem-h" className="font-serif text-2xl">Membership</h2>
          <div className="mt-3"><Badge tone={status === 'active' ? 'green' : 'saffron'}>{statusLabel}</Badge></div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-charcoal-600">Number</dt><dd className="font-semibold">{member.membershipNumber ?? '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-charcoal-600">Member since</dt><dd className="font-semibold">{d(member.memberSince)}</dd></div>
            <div className="flex justify-between"><dt className="text-charcoal-600">Valid until</dt><dd className="font-semibold">{d(member.expiryDate)}</dd></div>
            <div className="flex justify-between"><dt className="text-charcoal-600">Auto-renew</dt><dd className="font-semibold">{member.autoRenew ? 'On' : 'Off'}</dd></div>
          </dl>
          {status !== 'active' || true ? (
            <form action={renewMembership} className="mt-5">
              <button className={`min-h-12 w-full cursor-pointer rounded-full font-semibold ${status === 'active' ? 'border border-saffron-200 text-saffron-800 hover:bg-saffron-50' : 'bg-saffron-700 text-white hover:bg-saffron-800'}`}>{status === 'pending-payment' ? 'Pay £20 to activate' : 'Renew for £20'}</button>
            </form>
          ) : null}
        </section>

        <section className="card p-6 lg:col-span-2" aria-labelledby="book-h">
          <h2 id="book-h" className="font-serif text-2xl">My bookings</h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-charcoal-600">No upcoming bookings. <Link href="/events" className="font-semibold text-saffron-800 underline">See events</Link> or <Link href="/services" className="font-semibold text-saffron-800 underline">book a service</Link>.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ivory-300">
              {upcoming.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold">{b.itemTitle}</p>
                    <p className="text-sm text-charcoal-600">{dt(b.startsAt)} · {b.reference}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={b.status === 'confirmed' ? 'green' : 'saffron'}>{BOOKING_STATUS_LABELS[b.status]}</Badge>
                    <Link href={`/bookings/${b.reference}`} className="min-h-11 content-center text-sm font-semibold text-saffron-800 underline">Manage</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {past.length > 0 && <p className="mt-4 text-sm text-charcoal-500">{past.length} past booking{past.length === 1 ? '' : 's'}.</p>}
        </section>

        <section className="card p-6 lg:col-span-2" aria-labelledby="giv-h">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="giv-h" className="font-serif text-2xl">Giving and receipts</h2>
            <Link href="/account/statement" className="font-semibold text-saffron-800 underline">Annual giving statement</Link>
          </div>
          {donations.docs.length + payments.docs.length === 0 ? (
            <p className="mt-3 text-charcoal-600">No gifts or payments yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ivory-300">
              {donations.docs.map((g) => (
                <li key={`d${g.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold">{formatMoney(g.amount, g.currency ?? 'GBP')} · {FUND_LABELS[g.fund as keyof typeof FUND_LABELS]}</p>
                    <p className="text-sm text-charcoal-600">{d(g.paidAt ?? g.createdAt)} · {g.frequency === 'monthly' ? 'Monthly' : 'One-off'}{g.giftAidEligible ? ' · Gift Aid' : ''}</p>
                  </div>
                  {(g.status === 'paid' || g.status === 'active') && <Link href={`/receipt/${g.reference}`} className="min-h-11 content-center text-sm font-semibold text-saffron-800 underline">Receipt</Link>}
                </li>
              ))}
              {payments.docs.map((p) => (
                <li key={`p${p.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold">{formatGBP(p.amount)} · {p.description}</p>
                    <p className="text-sm text-charcoal-600">{d(p.paidAt)}</p>
                  </div>
                  <Link href={`/receipt/${p.receiptNumber}`} className="min-h-11 content-center text-sm font-semibold text-saffron-800 underline">Receipt</Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6 lg:col-span-1" aria-labelledby="data-h">
          <h2 id="data-h" className="font-serif text-2xl">Your data</h2>
          <p className="mt-2 text-sm text-charcoal-600">Download everything we hold about you, or ask us to delete it (UK GDPR).</p>
          <a href="/account/export" className="mt-4 inline-flex min-h-11 items-center rounded-full border border-charcoal-400 px-5 font-semibold hover:bg-ivory-200">Download my data</a>
          <DataRequest />
        </section>

        <section className="card p-6 lg:col-span-3" aria-labelledby="prof-h">
          <h2 id="prof-h" className="font-serif text-2xl">My details</h2>
          <ProfileForm
            member={{
              firstName: member.firstName,
              lastName: member.lastName ?? '',
              phone: member.phone ?? '',
              addressLine1: member.addressLine1 ?? '',
              addressLine2: member.addressLine2 ?? '',
              town: member.town ?? '',
              postcode: member.postcode ?? '',
              newsletter: Boolean(member.consents?.newsletter),
              sms: Boolean(member.consents?.sms),
              autoRenew: Boolean(member.autoRenew),
              giftAid: Boolean(member.giftAid?.declared),
              email: member.email,
            }}
          />
        </section>
      </div>
    </div>
  )
}
