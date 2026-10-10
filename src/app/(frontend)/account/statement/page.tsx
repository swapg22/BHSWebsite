import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentMember, getPayloadClient, getSettings } from '@/lib/data'
import { formatGBP } from '@/lib/money'
import { FUND_LABELS } from '@/lib/labels'
import { PrintButton } from '@/components/PrintButton'

export const metadata: Metadata = { title: 'Annual giving statement', robots: { index: false } }
export const dynamic = 'force-dynamic'

/** UK tax year runs 6 April – 5 April. */
function taxYear(startYear: number) {
  return { from: new Date(Date.UTC(startYear, 3, 6)), to: new Date(Date.UTC(startYear + 1, 3, 6)) }
}

export default async function StatementPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const member = await getCurrentMember()
  if (!member) redirect('/account/login?next=/account/statement')
  const now = new Date()
  const current = now >= new Date(Date.UTC(now.getUTCFullYear(), 3, 6)) ? now.getUTCFullYear() : now.getUTCFullYear() - 1
  const y = Number((await searchParams).year) || current
  const { from, to } = taxYear(y)
  const payload = await getPayloadClient()
  const settings = await getSettings()
  const { docs } = await payload.find({
    collection: 'donations',
    where: { and: [{ member: { equals: member.id } }, { status: { in: ['paid', 'active'] } }, { paidAt: { greater_than_equal: from.toISOString() } }, { paidAt: { less_than: to.toISOString() } }] },
    sort: 'paidAt',
    limit: 500,
    depth: 0,
    user: member,
    overrideAccess: false,
  })
  const total = docs.reduce((s, d) => s + (d.currency === 'GBP' ? d.amount : 0), 0)
  const ga = docs.filter((d) => d.giftAidEligible).reduce((s, d) => s + d.amount, 0)
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-ivory-300 bg-white p-8 sm:p-12 print:border-0 print:p-0">
        <p className="font-serif text-2xl">Bharat Hindu Samaj · charity {settings.charityNumber}</p>
        <h1 className="mt-4 text-4xl">Giving statement {y}–{String(y + 1).slice(2)}</h1>
        <p className="mt-2 text-charcoal-600">{member.firstName} {member.lastName} · tax year 6 April {y} to 5 April {y + 1}</p>
        <nav className="no-print mt-4 flex gap-4 text-sm">
          <Link className="underline" href={`/account/statement?year=${y - 1}`}>← {y - 1}–{String(y).slice(2)}</Link>
          {y < current && <Link className="underline" href={`/account/statement?year=${y + 1}`}>{y + 1}–{String(y + 2).slice(2)} →</Link>}
        </nav>
        <table className="mt-6 w-full text-left">
          <thead className="border-b border-ivory-300 text-sm text-charcoal-600"><tr><th className="py-2">Date</th><th>Reference</th><th>Fund</th><th>Gift Aid</th><th className="text-right">Amount</th></tr></thead>
          <tbody className="divide-y divide-ivory-300">
            {docs.map((d) => (
              <tr key={d.id}>
                <td className="py-2">{new Intl.DateTimeFormat('en-GB').format(new Date(d.paidAt!))}</td>
                <td>{d.reference}</td>
                <td>{FUND_LABELS[d.fund as keyof typeof FUND_LABELS]}</td>
                <td>{d.giftAidEligible ? 'Yes' : 'No'}</td>
                <td className="text-right tabular-nums">{formatGBP(d.amount)}</td>
              </tr>
            ))}
            {docs.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-charcoal-500">No gifts in this tax year.</td></tr>}
          </tbody>
        </table>
        <dl className="mt-6 space-y-1 text-right">
          <div><dt className="inline text-charcoal-600">Total given: </dt><dd className="inline font-semibold">{formatGBP(total)}</dd></div>
          <div><dt className="inline text-charcoal-600">Gift Aided: </dt><dd className="inline font-semibold">{formatGBP(ga)} (HMRC adds {formatGBP(Math.floor(ga * 0.25))})</dd></div>
        </dl>
        <p className="mt-6 text-sm text-charcoal-600">Higher-rate taxpayers can claim additional relief on Gift Aided donations through self-assessment.</p>
        <div className="no-print mt-8"><PrintButton /></div>
      </div>
    </div>
  )
}
