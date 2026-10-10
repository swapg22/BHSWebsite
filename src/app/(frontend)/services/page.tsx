import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import type { Service } from '@/payload-types'
import { getPayloadClient } from '@/lib/data'
import { formatGBP } from '@/lib/money'
import { SERVICE_CATEGORY_LABELS } from '@/lib/labels'
import { PageHeader, ButtonLink, Badge } from '@/components/ui'

export const metadata: Metadata = { title: 'Services and bookings', description: 'Poojas and ceremonies, hall and kitchen hire, classes and lunch club at Bharat Hindu Samaj, with prices and online booking.' }
export const revalidate = 300

const price = (s: Service, member: boolean) => {
  if (s.priceOnRequest) return 'On request'
  const p = member ? s.memberPrice : s.nonMemberPrice
  return p ? formatGBP(p) : 'Free'
}

export default async function ServicesPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'services', where: { availability: { equals: 'active' } }, sort: 'sortOrder', limit: 200, depth: 0 })
  const by = (c: string) => docs.filter((s) => s.category === c)
  const poojas = by('pooja')
  const halls = by('hall')
  const meals = by('meal')

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Poojas, ceremonies and hall hire"
        intro="Our pujari can perform ceremonies at the Mandir or at your home, and our halls are available for family and community occasions. Request a date online; the temple office confirms every booking."
      >
        <div className="flex flex-wrap gap-2">
          {[
            ['#pooja', 'Poojas & ceremonies'],
            ['#hall', 'Hall & kitchen hire'],
            ['#meal', 'Lunch club'],
            ['/activities', 'Classes & activities'],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="inline-flex min-h-11 items-center rounded-full border border-ivory-400 bg-white px-4 text-sm font-semibold hover:border-charcoal-400">
              {label}
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="container-page space-y-20 py-14 sm:py-20">
        <section id="pooja" aria-labelledby="pooja-title" className="scroll-mt-28">
          <div className="mb-8 max-w-2xl">
            <h2 id="pooja-title" className="text-3xl sm:text-4xl">
              {SERVICE_CATEGORY_LABELS.pooja}
            </h2>
            <p className="mt-3 text-lg text-charcoal-600">Member prices apply if at least one person in your household is a member. Requests are approved by the treasurer or administrator, subject to the pujari’s availability.</p>
          </div>
          <div className="overflow-x-auto rounded-3xl border border-ivory-300 bg-white">
            <table className="w-full min-w-[40rem] text-left">
              <caption className="sr-only">Ceremony price list</caption>
              <thead className="bg-ivory-200/70 text-sm text-charcoal-600">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Ceremony
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    Members
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    Non-members
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    Pooja materials (optional)
                  </th>
                  <th scope="col" className="px-5 py-3">
                    <span className="sr-only">Book</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-300">
                {poojas.map((s) => (
                  <tr key={s.id}>
                    <th scope="row" className="px-5 py-4 font-medium text-charcoal-900">
                      {s.name}
                    </th>
                    <td className="px-5 py-4 text-right tabular-nums">{price(s, true)}</td>
                    <td className="px-5 py-4 text-right tabular-nums">{price(s, false)}</td>
                    <td className="px-5 py-4 text-right tabular-nums">{s.materialsPrice ? formatGBP(s.materialsPrice) : 'N/A'}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/book/${s.slug}`} className="inline-flex min-h-11 items-center rounded-full bg-saffron-700 px-4 text-sm font-semibold text-white hover:bg-saffron-800">
                        Request<span className="sr-only"> {s.name}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {poojas[0]?.notes && <p className="mt-4 max-w-3xl text-sm text-charcoal-600">{poojas[0].notes}</p>}
          <p className="mt-2 max-w-3xl text-sm text-charcoal-600">
            We also accept donations for <strong>Pithru Puja</strong> (special prayers for your ancestors) — please contact the office.
          </p>
        </section>

        <section id="hall" aria-labelledby="hall-title" className="scroll-mt-28">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 id="hall-title" className="text-3xl sm:text-4xl">
                {SERVICE_CATEGORY_LABELS.hall}
              </h2>
              <p className="mt-3 text-lg text-charcoal-600">Choose a date and see free times straight away. The office confirms your booking and price, then you pay online. Legal licensed marriages can be held at the Mandir.</p>
              <Link href="/hall-hire-terms" className="mt-4 inline-block font-semibold text-saffron-800 underline">
                Read the hall and kitchen hire policy
              </Link>
              <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-3xl">
                <Image src="/images/bollywood-dance.jpg" alt="The main hall in use for a dance class" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </div>
            </div>
            <ul className="grid gap-5 lg:col-span-7">
              {halls.map((s) => (
                <li key={s.id} className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-serif text-2xl">{s.name}</h3>
                    {s.summary && <p className="mt-1 text-charcoal-600">{s.summary}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone="neutral">Price on request</Badge>
                      {s.deposit ? <Badge tone="gold">Deposit {formatGBP(s.deposit)}</Badge> : null}
                      <Badge tone="green">Approval by the office</Badge>
                    </div>
                  </div>
                  <ButtonLink href={`/book/${s.slug}`} className="shrink-0">
                    Check dates
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="meal" aria-labelledby="meal-title" className="scroll-mt-28">
          <h2 id="meal-title" className="text-3xl sm:text-4xl">
            {SERVICE_CATEGORY_LABELS.meal}
          </h2>
          <ul className="mt-8 grid gap-5 md:grid-cols-2">
            {meals.map((s) => (
              <li key={s.id} className="card flex flex-col p-6">
                <h3 className="font-serif text-2xl">{s.name}</h3>
                <p className="mt-1 text-charcoal-600">
                  {(s.availableDays ?? []).map((d) => d[0].toUpperCase() + d.slice(1)).join(' and ')} · {s.earliestTime}–{s.latestTime}
                </p>
                {s.summary && <p className="mt-2 text-charcoal-600">{s.summary}</p>}
                <div className="mt-5">
                  <ButtonLink href={`/book/${s.slug}`} variant="secondary">
                    Reserve a place
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
