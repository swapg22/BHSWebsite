import type { Metadata } from 'next'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import { getGovernance, mediaAlt, mediaUrl } from '@/lib/data'
import { PageHeader } from '@/components/ui'

export const metadata: Metadata = { title: 'Committee and trustees', description: 'The volunteers who run Bharat Hindu Samaj.' }
export const revalidate = 300

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
}

function People({ title, people }: { title: string; people: { name: string; role?: string | null; photo?: number | Media | null; photoConsent?: boolean | null }[] }) {
  return (
    <section aria-labelledby={`h-${title}`} className="reveal">
      <h2 id={`h-${title}`} className="mb-6 text-3xl">
        {title}
      </h2>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {people.map((p) => {
          const photo = p.photoConsent ? mediaUrl(p.photo as Media, 'thumb') : null
          return (
            <li key={p.name} className="card flex flex-col items-center p-5 text-center">
              {photo ? (
                <Image src={photo} alt="" width={96} height={96} className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <span aria-hidden="true" className="grid h-24 w-24 place-items-center rounded-full bg-kumkum-50 font-serif text-3xl text-kumkum-800">
                  {initials(p.name)}
                </span>
              )}
              <p className="mt-4 font-semibold">{p.name}</p>
              {p.role && <p className="text-sm text-charcoal-600">{p.role}</p>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default async function CommitteePage() {
  const g = await getGovernance()
  const photo = mediaUrl(g.committeePhoto as Media, 'hero')
  const committee = g.committee ?? []
  const executives = committee.filter((c) => c.role && !/committee member/i.test(c.role))
  const members = committee.filter((c) => !c.role || /committee member/i.test(c.role))
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Committee and trustees"
        intro="Bharat Hindu Samaj is run by volunteers. The executive committee is elected at the Annual General Meeting each year, and the trustees safeguard the charity and its property."
      />
      <div className="container-page space-y-16 py-14">
        <People title="Executive committee" people={executives} />
        <People title="Committee members" people={members} />
        <People title="Trustees" people={g.trustees ?? []} />
        {photo && (
          <figure className="reveal">
            <div className="relative overflow-hidden rounded-3xl border border-ivory-300 bg-white">
              <Image src={photo} alt={mediaAlt(g.committeePhoto as Media, 'The committee')} width={1600} height={1340} className="h-auto w-full" />
            </div>
            <figcaption className="mt-3 text-sm text-charcoal-500">Our team, 2025.</figcaption>
          </figure>
        )}
      </div>
    </>
  )
}
