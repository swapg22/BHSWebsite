import type { Metadata } from 'next'
import { formStartToken } from '@/lib/formGuard'
import { PageHeader } from '@/components/ui'
import { PledgeForm } from './PledgeForm'

export const metadata: Metadata = { title: 'Pledge a major gift', description: 'Pledge a major gift to the new Mandir, paid in instalments, with a trustee as your personal contact.' }

export default function PledgePage() {
  return (
    <>
      <PageHeader eyebrow="Major gifts" title="Pledge a major gift" intro="For gifts of £1,000 or more. Nothing is paid online today: tell us what you would like to give and a trustee will contact you personally to agree the details." />
      <div className="container-page grid gap-12 py-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PledgeForm token={formStartToken()} />
        </div>
        <aside className="card h-fit p-6 lg:col-span-5">
          <h2 className="font-serif text-2xl">How pledges work</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-charcoal-700">
            <li>Send your pledge — it creates a private record for the treasurer.</li>
            <li>A trustee contacts you the way you prefer.</li>
            <li>Together you agree an instalment plan, Gift Aid and any dedication.</li>
            <li>You receive receipts and an annual statement for every payment.</li>
          </ol>
        </aside>
      </div>
    </>
  )
}
