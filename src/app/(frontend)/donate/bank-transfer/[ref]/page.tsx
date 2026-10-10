import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient, getSettings } from '@/lib/data'
import { readToken } from '@/lib/signing'
import { formatGBP } from '@/lib/money'
import { Notice } from '@/components/ui'

export const metadata: Metadata = { title: 'Bank transfer details', robots: { index: false } }
export const dynamic = 'force-dynamic'

/** Bank details are shown only inside the donate flow, behind a signed link (spec section 6). */
export default async function BankTransferPage({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ t?: string }> }) {
  const { ref } = await params
  const { t } = await searchParams
  if (readToken<{ ref: string }>(t)?.ref !== ref) notFound()
  const payload = await getPayloadClient()
  const d = (await payload.find({ collection: 'donations', where: { reference: { equals: ref } }, limit: 1, overrideAccess: true })).docs[0]
  if (!d) notFound()
  const s = await getSettings()
  const bank = s.bank
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">{d.method === 'standing-order' ? 'Set up your standing order' : 'Complete your bank transfer'}</h1>
        <p className="mt-4 text-lg text-charcoal-700">Thank you, {d.firstName}. Please use the reference below so the treasurer can match your gift. We have also emailed these details to you.</p>
        <dl className="card mt-8 divide-y divide-ivory-300">
          {[
            ['Amount', `${formatGBP(d.amount)}${d.frequency === 'monthly' ? ' each month' : ''}`],
            ['Reference', d.reference],
            ['Account name', bank?.accountName],
            ['Sort code', bank?.sortCode],
            ['Account number', bank?.accountNumber],
          ].map(([k, val]) => (
            <div key={k} className="flex justify-between gap-4 px-6 py-4">
              <dt className="text-charcoal-600">{k}</dt>
              <dd className="font-semibold tabular-nums">{val || '—'}</dd>
            </div>
          ))}
        </dl>
        {!bank?.accountNumber && <div className="mt-6"><Notice tone="warning">Bank details have not been added yet. The treasurer will email them to you.</Notice></div>}
        <p className="mt-6 text-charcoal-600">Once your transfer arrives, the treasurer marks your gift as received and your receipt is emailed.</p>
      </div>
    </div>
  )
}
