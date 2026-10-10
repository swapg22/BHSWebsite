import type { Metadata } from 'next'
import { CheckCircle2, Share2 } from 'lucide-react'
import { getPayloadClient } from '@/lib/data'
import { isReference } from '@/lib/reference'
import { formatMoney } from '@/lib/money'
import { receiptUrl } from '@/lib/fulfilment'
import { ButtonLink, LotusMark } from '@/components/ui'
import { siteUrl } from '@/lib/payments'

export const metadata: Metadata = { title: 'Thank you', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams
  const payload = await getPayloadClient()
  const donation = ref && isReference(ref) ? (await payload.find({ collection: 'donations', where: { reference: { equals: ref } }, limit: 1, overrideAccess: true, depth: 0 })).docs[0] : null
  const paid = donation && (donation.status === 'paid' || donation.status === 'active')
  const share = `${siteUrl()}/donate?c=shared`
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-saffron-700 text-ivory-50">
          <LotusMark className="h-11 w-11" />
        </span>
        <h1 className="mt-6 text-5xl">Thank you{donation ? `, ${donation.firstName}` : ''}</h1>
        {donation ? (
          <>
            <p className="mt-4 text-xl text-charcoal-700">
              {paid ? (
                <>Your {donation.frequency === 'monthly' ? 'monthly ' : ''}gift of <strong>{formatMoney(donation.amount, donation.currency ?? 'GBP')}</strong> has been received.</>
              ) : (
                'We are confirming your payment with the provider. Your receipt will arrive by email shortly.'
              )}
            </p>
            {paid && donation.giftAidEligible && <p className="mt-2 flex items-center justify-center gap-2 text-charcoal-600"><CheckCircle2 aria-hidden="true" className="h-5 w-5 text-[#15803d]" /> Gift Aid adds {formatMoney(Math.floor(donation.amount * 0.25))} at no cost to you.</p>}
            <p className="mt-2 text-charcoal-600">Reference: <strong>{donation.reference}</strong></p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {paid && <ButtonLink href={receiptUrl(donation.reference).replace(siteUrl(), '')}>Download receipt</ButtonLink>}
              <ButtonLink href="/new-mandir" variant="secondary">Follow the new Mandir</ButtonLink>
            </div>
          </>
        ) : (
          <p className="mt-4 text-xl text-charcoal-700">Your generosity keeps our Mandir serving the community.</p>
        )}
        <div className="mt-12 rounded-3xl border border-ivory-300 bg-white p-6">
          <p className="flex items-center justify-center gap-2 font-semibold"><Share2 aria-hidden="true" className="h-5 w-5" /> Invite family and friends to give</p>
          <p className="mt-2 break-all text-charcoal-600">{share}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <a href={`https://wa.me/?text=${encodeURIComponent(`I have just given to the new Bharat Hindu Samaj Mandir in Peterborough. Join me: ${share}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-charcoal-400 px-5 font-semibold hover:bg-ivory-100">Share on WhatsApp</a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-charcoal-400 px-5 font-semibold hover:bg-ivory-100">Share on Facebook</a>
          </div>
        </div>
      </div>
    </div>
  )
}
