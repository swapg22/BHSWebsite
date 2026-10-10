import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '@/lib/data'
import { formatGBP } from '@/lib/money'
import { PageHeader, Badge } from '@/components/ui'

export const metadata: Metadata = { title: 'Classes and activities', description: 'Weekly yoga, dance, language classes, bhajans, sport and clubs at Bharat Hindu Samaj — free for members.' }
export const revalidate = 300

const ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const label = (d: string) => d[0].toUpperCase() + d.slice(1)
const t12 = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}${m ? `.${String(m).padStart(2, '0')}` : ''}${h < 12 ? 'am' : 'pm'}`
}

export default async function ActivitiesPage() {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'services', where: { and: [{ category: { in: ['class', 'meal'] } }, { availability: { equals: 'active' } }] }, sort: 'sortOrder', limit: 100, depth: 0 })
  const byDay = ORDER.map((d) => ({ day: d, items: docs.filter((s) => (s.availableDays ?? []).includes(d as never)).sort((a, b) => (a.earliestTime ?? '').localeCompare(b.earliestTime ?? '')) }))

  return (
    <>
      <PageHeader eyebrow="Be active @ BHS" title="Classes and activities" intro="Be active, stay social: badminton, Bollywood beats, language lessons, lunch club, table tennis and more — free for BHS members unless shown. A voluntary £1 per session helps keep activities running." />
      <div className="container-page py-14">
        <div className="grid gap-6 lg:grid-cols-7">
          {byDay.map(({ day, items }) => (
            <section key={day} aria-labelledby={`day-${day}`} className="lg:col-span-1">
              <h2 id={`day-${day}`} className="mb-3 border-b-2 border-saffron-600 pb-2 font-serif text-2xl">
                {label(day)}
              </h2>
              <ul className="space-y-3">
                {items.length === 0 && <li className="text-sm text-charcoal-500">Mandir open as usual</li>}
                {items.map((s) => (
                  <li key={s.id} className="rounded-2xl border border-ivory-300 bg-white p-4">
                    <p className="text-sm font-semibold text-saffron-800">
                      {t12(s.earliestTime ?? '')}–{t12(s.latestTime ?? '')}
                    </p>
                    <p className="mt-0.5 font-semibold leading-snug">{s.name}</p>
                    <p className="mt-1 text-sm text-charcoal-600">{s.memberPrice ? `${formatGBP(s.memberPrice)} ${s.priceUnit}` : 'Free for members'}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <h2 className="mt-20 text-3xl sm:text-4xl">Join a class</h2>
        <p className="mt-2 max-w-2xl text-charcoal-600">Sign up for a session so the organiser knows you are coming. Organisers keep a register for safety.</p>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((s) => (
            <li key={s.id} className="card flex flex-col p-6">
              <div className="flex flex-wrap gap-2">
                {(s.availableDays ?? []).map((d) => (
                  <Badge key={d} tone="neutral">
                    {label(d).slice(0, 3)}
                  </Badge>
                ))}
              </div>
              <h3 className="mt-3 font-serif text-2xl">{s.name}</h3>
              <p className="mt-1 text-charcoal-600">
                {t12(s.earliestTime ?? '')}–{t12(s.latestTime ?? '')}
              </p>
              {s.summary && <p className="mt-2 flex-1 text-sm text-charcoal-600">{s.summary}</p>}
              <Link href={`/book/${s.slug}`} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-saffron-200 font-semibold text-saffron-800 hover:border-saffron-700 hover:bg-saffron-50">
                Sign up<span className="sr-only"> for {s.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-16 grid items-center gap-8 rounded-3xl bg-ivory-200/70 p-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl">Also at BHS</h2>
            <ul className="mt-4 space-y-2 text-charcoal-700">
              <li>Outdoor trips: beach trip and cricket in summer, picnic in September</li>
              <li>Kids theatre, children’s Ganesh play and kids dance</li>
              <li>Karaoke evenings — contact us for dates</li>
              <li>First-aider training and dementia awareness sessions</li>
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image src="/images/shakha.jpg" alt="Children and parents playing Shakha family games" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </div>
    </>
  )
}
