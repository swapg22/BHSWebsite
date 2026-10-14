import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ExternalLink } from 'lucide-react'
import type { Media } from '@/payload-types'
import { getAppeal, getPayloadClient, mediaAlt, mediaUrl } from '@/lib/data'
import { getAppealTotals } from '@/lib/reports'
import { formatGBP } from '@/lib/money'
import { ButtonLink, SectionHeading } from '@/components/ui'
import { AppealProgress, ArtistsImpressionLabel, ArrowLink } from '@/components/shared'
import { ConceptMandir, ConceptPlan } from '@/components/home/ConceptMandir'
import { MandirAnatomy } from '@/components/temple/MandirAnatomy'
import { NewMandirHero } from '@/components/temple/NewMandirHero'
import { SacredJourney } from '@/components/temple/SacredJourney'
import { DeepaStambha, EngravedBackdrop } from '@/components/temple/Motifs'
import { PetalShower, ScallopEdge } from '@/components/temple/Animated'
import { CountUp } from '@/components/temple/CountUp'

export const metadata: Metadata = {
  title: 'The new Mandir',
  description: 'The vision for a new Bharat Hindu Samaj Mandir on our site in Peterborough: the parts of a traditional Mandir, the sacred stages of building one, and how your gift helps reach £1.2M.',
}
export const revalidate = 300

/** Our own photographs: the Mandir life the new building is for. */
const MEMORIES = [
  { src: '/images/ram-darbar.jpg', alt: 'The murtis of Shree Ram, Sita and Lakshman in the Mandir, dressed in yellow and red', caption: 'Shree Ram Darbar, installed in 1995' },
  { src: '/images/aarti-thali.jpg', alt: 'An aarti thali with lit diyas on marigold petals', caption: 'Aarti, twice every day' },
  { src: '/images/bhajan-children.jpg', alt: 'Children singing at a microphone with families seated behind them in the Mandir', caption: 'The next generation of bhajans' },
  { src: '/images/arrival-1972.jpg', alt: 'Black and white photograph of Ugandan Asian families arriving by plane in 1972', caption: 'Where it began: 1972 arrivals' },
  { src: '/images/lunch-club.jpg', alt: 'Seniors enjoying a festive meal at the lunch club', caption: 'Seva and friendship' },
]

const FAQ = [
  { q: 'Where will the new Mandir be?', a: 'On our present site, keeping the name Bharat Hindu Samaj, so that the Mandir stays where families have worshipped for decades.' },
  { q: 'What will it look like?', a: 'The pictures on this page are concepts to show the spirit of the project. The design will be developed with a temple architect (sthapati) and shared with members before any planning application.' },
  { q: 'When will building start?', a: 'The project is at the vision stage. The trustees will publish the build budget and timeline here as soon as they are planned, and every milestone will be announced in our newsletter.' },
  { q: 'Can I dedicate part of the Mandir to a loved one?', a: 'Yes. You can sponsor a brick, a pillar or a day of the build in a family name, with a name on the dedication plaque where offered.' },
  { q: 'How is my gift held?', a: 'Gifts to the appeal are recorded against the new Mandir fund and reported in our audited accounts. Our governance page explains how funds are held and who the trustees are.' },
  { q: 'Is the GoFundMe appeal the same thing?', a: 'No. The GoFundMe appeal funds the legal case about our site and is separate from gifts to the new Mandir.' },
  { q: 'Can I give time or skills instead?', a: 'Please do. Builders, architects, surveyors, project managers, cooks, teachers and organisers all have a part to play. Offer your help on the volunteer page.' },
  { q: 'Does Gift Aid apply?', a: 'Yes. If you are a UK taxpayer, Gift Aid adds 25p to every £1 you give, at no cost to you.' },
]

export default async function NewMandirPage() {
  const payload = await getPayloadClient()
  const [appeal, totals, updates, sponsorships] = await Promise.all([
    getAppeal(),
    getAppealTotals(payload),
    payload.find({ collection: 'news', where: { and: [{ _status: { equals: 'published' } }, { category: { equals: 'appeal' } }] }, sort: '-publishedAt', limit: 3, depth: 0 }),
    payload.find({ collection: 'sponsorship-items', where: { active: { equals: true } }, sort: 'sortOrder', limit: 6, depth: 0 }),
  ])
  const visuals = (appeal.conceptVisuals ?? []).filter((v) => mediaUrl(v.image as Media))
  const percent = totals.target ? Math.min(100, Math.round((totals.raised / totals.target) * 100)) : 0

  return (
    <>
      {/* Hero: the vision, in engraved line-work at dusk */}
      <NewMandirHero as="h1" id="mandir-title" stageLabel={appeal.stageLabel} totals={totals} />

      {/* At a glance */}
      <section aria-label="The appeal at a glance" className="bg-marigold-400 text-kumkum-900">
        <dl className="container-page reveal-stagger grid grid-cols-2 gap-px py-8 lg:grid-cols-4">
          {[
            { value: formatGBP(totals.target).replace('.00', ''), label: 'Our target' },
            { value: `${percent}%`, label: 'Raised so far' },
            { value: String(totals.donors), label: 'Donors and families' },
            { value: '1995', label: 'Our present Mandir consecrated' },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3 text-center">
              <dd className="font-serif text-4xl font-semibold sm:text-5xl">
                <CountUp value={s.value} />
              </dd>
              <dt className="mt-1 font-medium">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Why, with progress */}
      <section aria-labelledby="why-title" className="bg-haldi relative overflow-hidden py-16 sm:py-24">
        <div className="container-page relative grid gap-12 lg:grid-cols-12">
          <div className="reveal lg:col-span-6">
            <SectionHeading eyebrow="Why" id="why-title" title="Why a new Mandir" />
            <p className="whitespace-pre-line font-serif text-2xl leading-snug text-charcoal-800">{appeal.trusteesWords}</p>
            {appeal.trusteesAttribution && <p className="mt-4 text-charcoal-600">— {appeal.trusteesAttribution}</p>}
          </div>
          <div className="reveal card sheen p-7 lg:col-span-5 lg:col-start-8">
            <AppealProgress raised={totals.raised} target={totals.target} donors={totals.donors} stageLabel={appeal.stageLabel} />
            <p className="mt-6 text-charcoal-600">The build budget and timeline will be published here once the trustees have planned them. Until then the project is at the vision stage.</p>
            <ArrowLink href="/donor-wall">See our donor wall</ArrowLink>
          </div>
        </div>
      </section>

      {/* The vision: elevation and site plan of the new Mandir complex */}
      <section aria-labelledby="vision-title" className="bg-ivory-100 py-16 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="The vision" id="vision-title" title="The new Mandir complex" intro={appeal.visionIntro} />
          {visuals.length > 0 ? (
            <ul className="grid gap-6 md:grid-cols-2">
              {visuals.map((v, i) => (
                <li key={i}>
                  <figure className="sheen relative overflow-hidden rounded-3xl ring-1 ring-gold-500/40">
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
            <figure className="reveal relative overflow-hidden rounded-3xl bg-midnight-900 shadow-2xl shadow-kumkum-900/30 ring-1 ring-gold-500/40">
              <ConceptMandir className="aspect-[16/9] h-auto w-full" />
              <ArtistsImpressionLabel className="absolute left-4 top-4" />
              <figcaption className="border-t border-white/10 bg-charcoal-900 px-6 py-4 text-sm text-ivory-200">
                Front elevation at dusk: the shikhara over the sanctum rises behind the prayer hall, with the multi-purpose hall on one side and the library, office, kitchen and dining hall on the other. An early concept; the design will be developed with a temple architect.
              </figcaption>
            </figure>
          )}
          <div className="mt-14 grid gap-10">
            <figure className="reveal card relative overflow-hidden p-3 sm:p-5">
              <ConceptPlan className="h-auto w-full" />
              <ArtistsImpressionLabel className="absolute bottom-16 right-6 !bg-kumkum-800 sm:bottom-20 sm:right-8" />
              <figcaption className="px-2 pb-1 pt-3 text-sm text-charcoal-600">Indicative site plan. Sizes and positions will be set with the architect and through planning.</figcaption>
            </figure>
            <div className="reveal">
              <h2 className="text-3xl">Spaces for worship, learning and seva</h2>
              <ol className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                {(appeal.spaces ?? []).map((s, i) => (
                  <li key={s.name} className="flex gap-3">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-kumkum-700 text-sm font-bold text-ivory-50" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>
                      <span className="font-semibold">{s.name}</span>
                      {s.description && <span className="block text-charcoal-600">{s.description}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mandir today: our own photographs */}
      <section aria-labelledby="memories-title" className="bg-ivory-100 py-16 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="What we carry forward" id="memories-title" title="The life of our Mandir" intro="Fifty years of darshan, bhajans, seva and friendship. The new Mandir is a home for all of it, and for the generations to come." />
          <ul className="reveal-stagger grid grid-cols-2 gap-4 md:grid-cols-5">
            {MEMORIES.map((m, i) => (
              <li key={m.src} className={i === 0 ? 'col-span-2 md:col-span-1' : ''}>
                <figure className="torana sheen lift group relative aspect-[3/4] bg-kumkum-900">
                  <Image src={m.src} alt={m.alt} fill sizes="(min-width: 768px) 20vw, 50vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                  <figcaption className="scrim-bottom absolute inset-x-0 bottom-0 px-4 pb-4 pt-12 font-serif text-lg text-ivory-50">{m.caption}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Anatomy of a Mandir */}
      <ScallopEdge className="-mb-px bg-ivory-100 text-ivory-200" />
      <section aria-labelledby="anatomy-title" className="relative overflow-hidden bg-ivory-200 py-16 sm:py-24">
        <EngravedBackdrop className="text-gold-500 opacity-[0.07]" />
        <div className="container-page relative">
          <SectionHeading
            eyebrow="Understanding the Mandir"
            id="anatomy-title"
            title="The anatomy of a Hindu temple"
            intro="A traditional Mandir is built as a path from the everyday world to the divine: up the steps, through the hall, to the sanctum beneath the tower. Choose a part to learn its name and meaning."
          />
          <MandirAnatomy />
        </div>
      </section>
      <ScallopEdge flip className="-mt-px bg-ivory-100 text-ivory-200" />

      {/* The sacred journey */}
      <section aria-labelledby="journey-title" className="bg-peacock relative overflow-hidden py-16 text-ivory-100 sm:py-24">
        <EngravedBackdrop className="text-peacock-300 opacity-[0.07]" />
        <DeepaStambha className="pointer-events-none absolute -left-4 bottom-0 hidden h-[26rem] w-auto text-gold-300/60 2xl:block" />
        <DeepaStambha className="pointer-events-none absolute -right-4 bottom-0 hidden h-[26rem] w-auto text-gold-300/60 2xl:block" />
        <div className="container-page relative">
          <SectionHeading
            light
            eyebrow="From vision to consecration"
            id="journey-title"
            title="The sacred journey of building a Mandir"
            intro="A Mandir is not only constructed; it is consecrated. These are the stages, each marked with prayer, that our new Mandir will pass through."
          />
          <SacredJourney current="sankalp" />
        </div>
      </section>

      {/* How gifts build it */}
      <section aria-labelledby="gifts-title" className="bg-haldi py-16 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow="Every gift lays a stone" id="gifts-title" title="How your gift builds the Mandir" intro="Give any amount once or monthly, or dedicate a part of the Mandir in your family's name. Gift Aid adds 25% if you are a UK taxpayer." />
          <ul className="reveal-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sponsorships.docs.map((s) => (
              <li key={s.id} className="card bookmark sheen lift relative flex flex-col p-6">
                <span className="font-serif text-4xl font-semibold text-kumkum-800">{formatGBP(s.amount)}</span>
                <h3 className="mt-2 font-serif text-2xl">{s.name}</h3>
                {s.description && <p className="mt-2 flex-1 text-charcoal-700">{s.description}</p>}
                <Link href={`/donate/sponsor#item-${s.id}`} className="mt-4 font-semibold text-kumkum-800 after:absolute after:inset-0 hover:underline">
                  Sponsor a {s.name.toLowerCase()} →
                </Link>
              </li>
            ))}
            <li className="card bookmark sheen lift relative flex flex-col bg-kumkum-700 p-6 !text-ivory-50">
              <span className="font-serif text-4xl font-semibold text-marigold-300">Any amount</span>
              <h3 className="mt-2 font-serif text-2xl">A gift in faith</h3>
              <p className="mt-2 flex-1 text-ivory-100">Card, Apple Pay, Google Pay or Direct Debit, with an instant receipt.</p>
              <Link href="/donate" className="mt-4 font-semibold text-marigold-300 after:absolute after:inset-0 hover:underline">
                Give now →
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Inspiration */}
      <section aria-labelledby="inspiration-title" className="bg-ivory-100 py-16 sm:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-12">
          <div className="reveal lg:col-span-5">
            <SectionHeading eyebrow="Built by communities like ours" id="inspiration-title" title="Inspiration from British Hindu communities" />
            <p className="text-lg text-charcoal-700">Across Britain, Hindu communities have raised traditional Mandirs gift by gift, often over many years and with hand-carved stone. Their journeys show what a determined community can build together.</p>
          </div>
          <ul className="reveal-stagger grid gap-5 lg:col-span-7 sm:grid-cols-2">
            {[
              {
                name: 'Shree Sanatan Hindu Mandir, Wembley',
                text: 'Built over about fourteen years from stone hand-carved in Gujarat and assembled in London, it opened in 2010 as a traditional stone Mandir.',
                href: 'https://en.wikipedia.org/wiki/Shree_Sanatan_Hindu_Mandir',
              },
              {
                name: 'BAPS Shri Swaminarayan Mandir, Neasden',
                text: 'Opened in 1995, the same year as our own Pran Pratishtha. Thousands of pieces of limestone and marble were carved in India and assembled by volunteers and craftsmen.',
                href: 'https://en.wikipedia.org/wiki/BAPS_Shri_Swaminarayan_Mandir_London',
              },
            ].map((p) => (
              <li key={p.name} className="card lift relative flex flex-col border-t-4 !border-t-marigold-400 p-6">
                <h3 className="font-serif text-2xl">{p.name}</h3>
                <p className="mt-2 flex-1 text-charcoal-700">{p.text}</p>
                <a href={p.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-kumkum-800 hover:underline">
                  Read more <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only"> about {p.name} (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Milestones and updates */}
      <section aria-labelledby="milestones-title" className="bg-ivory-200/70 py-16 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div className="reveal">
            <SectionHeading eyebrow="Milestones" id="milestones-title" title="Our journey so far" />
            <ol className="relative space-y-8 border-l-2 border-marigold-400 pl-8">
              {(appeal.milestones ?? []).map((m) => (
                <li key={m.title} className="relative">
                  <span aria-hidden="true" className={`absolute -left-[2.6rem] top-1 h-5 w-5 rounded-full border-2 ${m.status === 'done' ? 'border-kumkum-700 bg-kumkum-700' : m.status === 'current' ? 'animate-pulse border-sindoor-500 bg-marigold-300 ring-4 ring-marigold-300/50' : 'border-ivory-400 bg-ivory-50'}`} />
                  <p className="text-sm font-semibold text-kumkum-800">
                    {m.date}
                    <span className="sr-only"> — {m.status === 'done' ? 'completed' : m.status === 'current' ? 'in progress' : 'upcoming'}</span>
                  </p>
                  <p className="font-serif text-2xl">{m.title}</p>
                  {m.description && <p className="mt-1 text-charcoal-600">{m.description}</p>}
                </li>
              ))}
            </ol>
          </div>
          <div className="reveal">
            <SectionHeading eyebrow="Updates" title="Appeal news" />
            {updates.docs.length ? (
              <ul className="space-y-4">
                {updates.docs.map((n) => (
                  <li key={n.id} className="card lift p-5">
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

      {/* Questions */}
      <section aria-labelledby="faq-title" className="bg-ivory-100 py-16 sm:py-24">
        <div className="container-page max-w-4xl">
          <SectionHeading align="center" eyebrow="Questions" id="faq-title" title="Questions about the new Mandir" />
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="card group p-0 open:shadow-[var(--shadow-lift)]">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-serif text-xl [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-kumkum-700 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="px-6 pb-5 text-charcoal-700">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call */}
      <section aria-labelledby="cta-title" className="bg-festival relative isolate overflow-hidden py-20 text-center text-ivory-50">
        <PetalShower count={10} />
        <DeepaStambha className="pointer-events-none absolute bottom-0 left-2 hidden h-72 w-auto text-gold-300/70 md:block" />
        <DeepaStambha className="pointer-events-none absolute bottom-0 right-2 hidden h-72 w-auto text-gold-300/70 md:block" />
        <div className="container-page relative">
          <p lang="sa" className="font-indic text-2xl text-marigold-300">
            शुभं भवतु
          </p>
          <h2 id="cta-title" className="mx-auto mt-3 max-w-3xl text-4xl text-white sm:text-6xl">
            Lay a stone for the generations to come
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/donate" size="lg" variant="marigold">
              Give to the new Mandir
            </ButtonLink>
            <ButtonLink href="/volunteer" size="lg" variant="outline-light">
              Offer your skills
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
