import type { Metadata } from 'next'
import Link from 'next/link'
import { Landmark } from 'lucide-react'
import { getPayloadClient } from '@/lib/data'
import { formatGBP } from '@/lib/money'
import { PageHeader, Badge } from '@/components/ui'

export const metadata: Metadata = { title: 'Sponsor a brick, pillar, room or day', description: 'Dedicate part of the new Mandir in your family’s name.' }
export const revalidate = 60

export default async function SponsorPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'sponsorship-items', where: { active: { equals: true } }, sort: 'sortOrder', limit: 50, depth: 0 })
  return (
    <>
      <PageHeader eyebrow="Sponsorship" title="Sponsor part of the new Mandir" intro="Choose a sponsorship with a fixed amount. Most include your family’s name or a dedication on a plaque in the new Mandir." />
      <div className="container-page py-14">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {docs.map((s) => {
            const left = s.totalAvailable ? s.totalAvailable - (s.sponsoredCount ?? 0) : null
            const soldOut = left !== null && left <= 0
            return (
              <li key={s.id} id={`item-${s.id}`} className="card flex scroll-mt-28 flex-col p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-300/30 text-gold-600">
                  <Landmark aria-hidden="true" className="h-6 w-6" />
                </span>
                <h2 className="mt-4 font-serif text-3xl">{s.name}</h2>
                <p className="text-2xl font-semibold text-saffron-800">{formatGBP(s.amount)}</p>
                {s.description && <p className="mt-2 flex-1 text-charcoal-600">{s.description}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.plaque && <Badge tone="gold">Name on plaque</Badge>}
                  <Badge tone={soldOut ? 'neutral' : 'green'}>{left === null ? 'Unlimited' : soldOut ? 'All sponsored' : `${left} of ${s.totalAvailable} available`}</Badge>
                </div>
                {soldOut ? (
                  <p className="mt-5 text-center font-semibold text-charcoal-500">Fully sponsored — thank you</p>
                ) : (
                  <Link href={`/donate?sponsor=${s.id}`} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-saffron-700 font-semibold text-white hover:bg-saffron-800">
                    Sponsor<span className="sr-only"> a {s.name}</span>
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
        <p className="mt-10 max-w-3xl text-sm text-charcoal-600">Sponsorships where you receive a benefit (such as a named plaque) may not be eligible for Gift Aid. Plaque wording is checked by the committee before it is made.</p>
      </div>
    </>
  )
}
