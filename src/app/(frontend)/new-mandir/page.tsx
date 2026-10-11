import type { Metadata } from 'next'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import { getAppeal, getPayloadClient, mediaAlt, mediaUrl } from '@/lib/data'
import { getAppealTotals } from '@/lib/reports'
import { ButtonLink, SectionHeading } from '@/components/ui'
import { AppealProgress, ArtistsImpressionLabel, ArrowLink } from '@/components/shared'
import { ConceptMandir, ConceptPlan } from '@/components/home/ConceptMandir'

export const metadata: Metadata = { title: 'The new Mandir', description: 'The vision for a new Bharat Hindu Samaj Mandir on our site in Peterborough, and how you can help reach £1.2M.' }
export const revalidate = 300

export default async function NewMandirPage() {
  const payload = await getPayloadClient()
  const [appeal, totals, updates] = await Promise.all([
    getAppeal(),
    getAppealTotals(payload),
    payload.find({ collection: 'news', where: { and: [{ _status: { equals: 'published' } }, { category: { equals: 'appeal' } }] }, sort: '-publishedAt', limit: 3, depth: 0 }),
  ])
  const visuals = (appeal.conceptVisuals ?? []).filter((v) => mediaUrl(v.image as Media))

  return (
    <>
      <section className="relative overflow-hidden bg-midnight-900 text-ivory-50">
        <ConceptMandir className="absolute inset-0 h-full w-full opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-midnight-900/60 to-transparent" aria-hidden="true" />
        <div className="container-page relative flex min-h-[70svh] flex-col justify-end pb-14 pt-32">
          <ArtistsImpressionLabel className="mb-6 self-start" />
          <p className="eyebrow !text-gold-300">The new Mandir · {appeal.stageLabel ?? 'Vision stage'}</p>
          <h1 className="mt-3 max-w-3xl text-5xl text-white sm:text-7xl">A Mandir for the next fifty years</h1>
          <p className="mt-5 max-w-2xl text-lg text-ivory-100">Same name, same site, a new home for worship, learning and seva. Help us raise £1.2M.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/donate" size="lg">
              Give to the new Mandir
            </ButtonLink>
            <ButtonLink href="/donate/sponsor" size="lg" variant="outline-light">
              Sponsor a brick or pillar
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="bg-ivory-100 py-16 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading eyebrow="Why" title="Why a new Mandir" />
            <p className="whitespace-pre-line font-serif text-2xl leading-snug text-charcoal-800">{appeal.trusteesWords}</p>
            {appeal.trusteesAttribution && <p className="mt-4 text-charcoal-600">— {appeal.trusteesAttribution}</p>}
          </div>
          <div className="card p-7 lg:col-span-5 lg:col-start-8">
            <AppealProgress raised={totals.raised} target={totals.target} donors={totals.donors} stageLabel={appeal.stageLabel} />
            <p className="mt-6 text-charcoal-600">The build budget and timeline will be published here once the trustees have planned them. Until then the project is at the vision stage.</p>
          </div>
        </div>
      </section>

      <section className="bg-ivory-200/70 py-16 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="The vision" title="Concept visuals" intro={appeal.visionIntro} />
          {visuals.length > 0 ? (
            <ul className="grid gap-6 md:grid-cols-2">
              {visuals.map((v, i) => (
                <li key={i}>
                  <figure className="relative overflow-hidden rounded-3xl">
                    <div className="relative aspect-[16/10]">
                      <Image src={mediaUrl(v.image as Media, 'hero')!} alt={mediaAlt(v.image as Media, "Artist's impression")} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                    </div>
                    <ArtistsImpressionLabel className="absolute left-4 top-4" />
                    {v.caption && <figcaption className="bg-white p-4 text-sm text-charcoal-600">{v.caption}</figcaption>}
                  </figure>
                </li>
              ))}
            </ul>
          ) : (
            <figure className="relative overflow-hidden rounded-3xl">
              <ConceptMandir className="aspect-[16/9] h-auto w-full" />
              <ArtistsImpressionLabel className="absolute left-4 top-4" />
            </figure>
          )}
          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="card relative p-4">
              <ConceptPlan spaces={appeal.spaces ?? []} />
            </div>
            <div>
              <h2 className="text-3xl">How the concept will become a design</h2>
              <ol className="mt-5 list-decimal space-y-3 pl-5 text-lg text-charcoal-700">
                <li>The committee agrees the spaces the community needs.</li>
                <li>A temple architect or sthapati develops the form, axis and iconography.</li>
                <li>Plans are shared with members before any planning application.</li>
                <li>Concept visuals here are replaced with the architect’s drawings.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory-100 py-16 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Milestones" title="Our journey" />
            <ol className="relative space-y-8 border-l-2 border-ivory-400 pl-8">
              {(appeal.milestones ?? []).map((m) => (
                <li key={m.title} className="relative">
                  <span aria-hidden="true" className={`absolute -left-[2.6rem] top-1 h-5 w-5 rounded-full border-2 ${m.status === 'done' ? 'border-kumkum-700 bg-kumkum-700' : m.status === 'current' ? 'border-kumkum-700 bg-ivory-50 ring-4 ring-kumkum-100' : 'border-ivory-400 bg-ivory-50'}`} />
                  <p className="text-sm font-semibold text-kumkum-800">{m.date}</p>
                  <p className="font-serif text-2xl">{m.title}</p>
                  {m.description && <p className="mt-1 text-charcoal-600">{m.description}</p>}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionHeading eyebrow="Updates" title="Appeal news" />
            {updates.docs.length ? (
              <ul className="space-y-4">
                {updates.docs.map((n) => (
                  <li key={n.id} className="card p-5">
                    <ArrowLink href={`/news/${n.slug}`}>{n.title}</ArrowLink>
                    {n.excerpt && <p className="text-charcoal-600">{n.excerpt}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-charcoal-600">Appeal updates will appear here as the project moves forward. Sign up to our newsletter in the footer to hear first.</p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
