import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCurrentMember, getPayloadClient, getSettings } from '@/lib/data'
import { readToken } from '@/lib/signing'
import { formatMoney } from '@/lib/money'
import { FUND_LABELS } from '@/lib/labels'
import { LotusMark } from '@/components/ui'
import { PrintButton } from '@/components/PrintButton'

export const metadata: Metadata = { title: 'Receipt', robots: { index: false } }
export const dynamic = 'force-dynamic'

const date = (d?: string | null) => (d ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'Europe/London' }).format(new Date(d)) : '')

/** Instant receipt download (FR-24): signed link from the email, or the donor's own account. */
export default async function ReceiptPage({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ t?: string }> }) {
  const { ref } = await params
  const { t } = await searchParams
  const payload = await getPayloadClient()
  const member = await getCurrentMember()
  const tokenOk = readToken<{ ref: string }>(t)?.ref === ref

  const donation = (await payload.find({ collection: 'donations', where: { reference: { equals: ref } }, limit: 1, overrideAccess: true, depth: 0 })).docs[0]
  const payment = donation ? null : (await payload.find({ collection: 'payments', where: { receiptNumber: { equals: ref } }, limit: 1, overrideAccess: true, depth: 0 })).docs[0]
  const owner = donation?.member ?? payment?.member
  const ownerId = typeof owner === 'object' && owner ? owner.id : owner
  if (!(donation || payment) || !(tokenOk || (member && ownerId === member.id))) notFound()
  const settings = await getSettings()

  const rows: [string, string | null | undefined][] = donation
    ? [
        ['Receipt / reference', donation.reference],
        ['Date', date(donation.paidAt ?? donation.createdAt)],
        ['Donor', [donation.title, donation.donorName].filter(Boolean).join(' ')],
        ['Amount', formatMoney(donation.amount, donation.currency ?? 'GBP')],
        ['Type', donation.frequency === 'monthly' ? 'Monthly gift' : 'One-off gift'],
        ['Fund', FUND_LABELS[donation.fund as keyof typeof FUND_LABELS] ?? donation.fund],
        ['Gift Aid', donation.giftAidEligible ? `Declared — HMRC adds ${formatMoney(Math.floor(donation.amount * 0.25))}` : 'Not claimed'],
        ['Status', donation.status === 'refunded' ? 'Refunded' : donation.status === 'paid' || donation.status === 'active' ? 'Received with thanks' : 'Pending'],
      ]
    : [
        ['Receipt number', payment!.receiptNumber],
        ['Date', date(payment!.paidAt ?? payment!.createdAt)],
        ['Paid by', payment!.payerName ?? ''],
        ['For', payment!.description ?? (payment!.purpose === 'membership' ? 'Annual membership' : 'Booking')],
        ['Amount', formatMoney(payment!.amount)],
        ['Status', payment!.status === 'paid' ? 'Paid' : payment!.status],
      ]

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl rounded-3xl border border-ivory-300 bg-white p-8 sm:p-12 print:border-0 print:p-0">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-saffron-700 text-ivory-50"><LotusMark className="h-7 w-7" /></span>
          <div>
            <p className="font-serif text-2xl">Bharat Hindu Samaj</p>
            <p className="text-sm text-charcoal-500">Registered charity {settings.charityNumber}</p>
          </div>
        </div>
        <h1 className="mt-8 text-4xl">{donation ? 'Donation receipt' : 'Payment receipt'}</h1>
        <dl className="mt-6 divide-y divide-ivory-300 border-y border-ivory-300">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="text-charcoal-600">{k}</dt>
              <dd className="text-right font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-charcoal-600">{settings.registeredAddress}</p>
        <p className="mt-2 text-sm text-charcoal-600">Thank you for your support. Please keep this receipt for your records.</p>
        <div className="no-print mt-8"><PrintButton /></div>
      </div>
    </div>
  )
}
