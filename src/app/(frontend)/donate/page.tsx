import type { Metadata } from 'next'
import { getAppeal, getCurrentMember, getPayloadClient } from '@/lib/data'
import { getAppealTotals } from '@/lib/reports'
import { formStartToken } from '@/lib/formGuard'
import { paymentsMode } from '@/lib/payments'
import { FUND_LABELS, type FundKey } from '@/lib/labels'
import { Notice } from '@/components/ui'
import { AppealProgress, ArrowLink } from '@/components/shared'
import { ConceptMandir } from '@/components/home/ConceptMandir'
import { DonateForm } from './DonateForm'

export const metadata: Metadata = { title: 'Donate', description: 'Give to the new Mandir, daily seva, food service or education. Card, Apple Pay, Google Pay or Direct Debit, with Gift Aid.' }
export const dynamic = 'force-dynamic'

export default async function DonatePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams
  const payload = await getPayloadClient()
  const [appeal, totals, member] = await Promise.all([getAppeal(), getAppealTotals(payload), getCurrentMember()])
  const fund = sp.fund && sp.fund in FUND_LABELS ? (sp.fund as FundKey) : undefined
  let sponsorship = null
  if (sp.sponsor && /^\d+$/.test(sp.sponsor)) {
    const item = await payload.findByID({ collection: 'sponsorship-items', id: Number(sp.sponsor), depth: 0 }).catch(() => null)
    if (item?.active) sponsorship = { id: item.id, name: item.name, amount: item.amount, plaque: Boolean(item.plaque) }
  }
  const mode = paymentsMode()

  return (
    <div className="bg-ivory-100">
      <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow">Donate</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">{sponsorship ? 'Sponsor part of the new Mandir' : 'Give to Bharat Hindu Samaj'}</h1>
          <div className="mt-6 space-y-3">
            {sp.cancelled && <Notice tone="warning">Your payment was cancelled. Nothing has been charged — you can try again below.</Notice>}
            {sp.failed && <Notice tone="error">The payment did not go through. Nothing has been charged. Please try again or choose another method.</Notice>}
            {mode.card === 'demo' && <Notice tone="info" title="Test mode">Payments use a built-in demo checkout until Stripe and GoCardless keys are added. No money moves.</Notice>}
          </div>
          <div className="mt-6">
            <DonateForm
              token={formStartToken()}
              directDebitDemo={mode.directDebit === 'demo'}
              defaults={{
                frequency: sp.frequency === 'monthly' ? 'monthly' : 'one-off',
                fund,
                campaign: sp.c && /^[a-z0-9-]{1,60}$/i.test(sp.c) ? sp.c : undefined,
                sponsorship,
                name: member ? { first: member.firstName, last: member.lastName ?? '', email: member.email, house: member.addressLine1 ?? undefined, postcode: member.postcode ?? undefined } : undefined,
              }}
            />
          </div>
        </div>
        <aside className="lg:col-span-5">
          <div className="sticky top-28 space-y-5">
            <div className="overflow-hidden rounded-3xl bg-charcoal-900 text-ivory-50">
              <ConceptMandir className="aspect-[16/10] h-auto w-full" />
              <div className="p-6">
                <AppealProgress raised={totals.raised} target={totals.target} donors={totals.donors} stageLabel={appeal.stageLabel} tone="dark" />
                <ArrowLink href="/new-mandir" light>About the new Mandir</ArrowLink>
              </div>
            </div>
            <div className="card p-6 text-sm text-charcoal-700">
              <p className="font-semibold">Other ways to give</p>
              <ul className="mt-2 space-y-1">
                <li><ArrowLink href="/donate/sponsor">Sponsor a brick, pillar, room or day</ArrowLink></li>
                <li><ArrowLink href="/donate/pledge">Pledge a major gift</ArrowLink></li>
                <li><ArrowLink href="/donor-wall">See the donor wall</ArrowLink></li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
