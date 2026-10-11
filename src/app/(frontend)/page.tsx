import Image from 'next/image'
import Link from 'next/link'
import { FileText, HeartHandshake, Landmark, Repeat, Gift, Users, Flame, Clock, QrCode, ShieldCheck } from 'lucide-react'
import type { Media } from '@/payload-types'
import { getAppeal, getGovernance, getHome, getPayloadClient, getSettings, getTimes, getUpcomingEvents, mediaAlt, mediaUrl } from '@/lib/data'
import { getAppealTotals } from '@/lib/reports'
import { formatGBP } from '@/lib/money'
import { ButtonLink, JaaliBand, LotusMark, SectionHeading } from '@/components/ui'
import { AppealProgress, ArrowLink, ArtistsImpressionLabel, EventCard } from '@/components/shared'
import { ConceptMandir, ConceptPlan } from '@/components/home/ConceptMandir'
import { HeroMedia } from '@/components/home/HeroMedia'
import { ProgressMarker } from '@/components/home/ProgressMarker'

export const revalidate = 300

export default async function HomePage() {
  const payload = await getPayloadClient()
  const [home, appeal, governance, times, settings, totals, events, sponsorships] = await Promise.all([
    getHome(),
    getAppeal(),
    getGovernance(),
    getTimes(),
    getSettings(),
    getAppealTotals(payload),
    getUpcomingEvents(3),
    payload.find({ collection: 'sponsorship-items', where: { active: { equals: true } }, sort: 'sortOrder', limit: 4, depth: 0 }),
  ])
  const heroUrl = mediaUrl(home.heroImage as Media, 'hero') ?? '/images/bhajan-youth.jpg'
  const heroAlt = mediaAlt(home.heroImage as Media, 'Young devotees singing bhajans at the Mandir')
  const fundraisingEvents = events.filter((e) => e.category === 'fundraising')
  const strip = fundraisingEvents.length ? fundraisingEvents : events
  const visuals = (appeal.conceptVisuals ?? []).filter((v) => mediaUrl(v.image as Media))
  const court = appeal.courtNotice
  const gofundme = appeal.gofundme
  const voices = (home.voices ?? []).filter((v) => v.consent)

  return (
    <>
      <ProgressMarker />

      {/* 1. Welcome: today's Mandir */}
      <section id="today" aria-labelledby="welcome-title" className="relative isolate flex min-h-[calc(100svh-7.5rem)] items-end overflow-hidden text-ivory-50">
        <HeroMedia image={heroUrl} alt={heroAlt} videoUrl={home.heroVideoUrl} />
        <div className="scrim-bottom absolute inset-0" aria-hidden="true" />
        <div className="container-page relative pb-14 pt-32 sm:pb-20">
          <p className="eyebrow animate-fade-up !text-gold-300">{home.heritageLine ?? 'Serving Peterborough since 1973'}</p>
          <h1 id="welcome-title" className="mt-4 max-w-4xl animate-fade-up text-5xl leading-[1.02] text-white [animation-delay:120ms] sm:text-7xl lg:text-8xl">
            Bharat Hindu Samaj
          </h1>
          <p className="mt-5 max-w-2xl animate-fade-up text-lg text-ivory-100 [animation-delay:240ms] sm:text-xl">
            Peterborough&apos;s Shree Ram Mandir and community centre — a home for worship, festivals and friendship for over fifty years, and now the beginning of a new Mandir.
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap gap-3 [animation-delay:360ms]">
            <ButtonLink href="/donate" size="lg">
              <LotusMark className="h-5 w-5" />
              Donate to the new Mandir
            </ButtonLink>
            <ButtonLink href="/membership" size="lg" variant="outline-light">
              Join for £20 a year
            </ButtonLink>
          </div>
          <dl className="mt-10 grid max-w-3xl animate-fade-up gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md [animation-delay:480ms] sm:grid-cols-3">
            <div className="bg-charcoal-900/40 px-5 py-4">
              <dt className="flex items-center gap-2 text-sm text-gold-300">
                <Flame aria-hidden="true" className="h-4 w-4" /> Daily aarti
              </dt>
              <dd className="mt-1 text-lg font-semibold">{times.aarti}</dd>
            </div>
            <div className="bg-charcoal-900/40 px-5 py-4">
              <dt className="flex items-center gap-2 text-sm text-gold-300">
                <Clock aria-hidden="true" className="h-4 w-4" /> Weekdays
              </dt>
              <dd className="mt-1 text-lg font-semibold">{times.weekdays}</dd>
            </div>
            <div className="bg-charcoal-900/40 px-5 py-4">
              <dt className="flex items-center gap-2 text-sm text-gold-300">
                <Clock aria-hidden="true" className="h-4 w-4" /> Weekends
              </dt>
              <dd className="mt-1 text-lg font-semibold">{times.weekends}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 2. Our community today */}
      <section aria-labelledby="community-title" className="bg-ivory-100 py-20 sm:py-28">
        <div className="container-page">
          <div className="reveal grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <p className="eyebrow mb-3">Our community today</p>
              <h2 id="community-title" className="text-4xl sm:text-5xl">
                Fifty years of worship, service and togetherness
              </h2>
            </div>
            <p className="text-lg text-charcoal-600 lg:col-span-5 lg:col-start-8">
              What began in 1973 with thirty families settling in Peterborough is today a Mandir and community centre serving around a thousand members — open every day, run almost entirely by volunteers.
            </p>
          </div>
          {home.stats && home.stats.length > 0 && (
            <dl className="reveal mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ivory-300 bg-ivory-300 lg:grid-cols-4">
              {home.stats.map((s) => (
                <div key={s.label} className="bg-ivory-50 px-6 py-8">
                  <dd className="font-serif text-5xl text-kumkum-700 sm:text-6xl">{s.value}</dd>
                  <dt className="mt-2 text-charcoal-600">{s.label}</dt>
                </div>
              ))}
            </dl>
          )}
          <ul className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
            {(home.activityCards ?? []).map((c) => {
              const img = mediaUrl(c.image as Media, 'card')
              return (
                <li key={c.title}>
                  <Link href={c.href ?? '/activities'} className="torana group relative block aspect-[3/4] bg-midnight-800">
                    {img && <Image src={img} alt="" fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />}
                    <span className="scrim-bottom absolute inset-0" aria-hidden="true" />
                    <span className="absolute inset-x-0 bottom-0 p-5 text-ivory-50">
                      <span className="block font-serif text-2xl">{c.title}</span>
                      {c.text && <span className="mt-1 block text-sm text-ivory-200">{c.text}</span>}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <JaaliBand className="bg-ivory-100" />

      {/* 3. Why a new Mandir */}
      <section aria-labelledby="why-title" className="relative overflow-hidden bg-midnight-900 py-20 text-ivory-100 sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(227_162_26/0.18),transparent)]" />
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="reveal lg:col-span-6">
            <p className="eyebrow mb-3 !text-gold-300">Why a new Mandir</p>
            <h2 id="why-title" className="text-4xl text-ivory-50 sm:text-5xl">
              A permanent home for the next fifty years
            </h2>
            {appeal.trusteesWords && (
              <blockquote className="mt-8 border-l-2 border-gold-400 pl-6">
                <p className="whitespace-pre-line font-serif text-2xl leading-snug text-ivory-50 sm:text-[1.7rem]">{appeal.trusteesWords}</p>
                {appeal.trusteesAttribution && <footer className="mt-4 text-sm text-gold-300">— {appeal.trusteesAttribution}</footer>}
              </blockquote>
            )}
            <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {appeal.chairmanVideoUrl ? (
                <div className="aspect-video">
                  <iframe
                    src={appeal.chairmanVideoUrl.replace('watch?v=', 'embed/').replace('youtube.com', 'youtube-nocookie.com')}
                    title="A message from our chairman"
                    loading="lazy"
                    allow="accelerometer; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-3 p-8 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full border border-gold-400/50 text-gold-300">
                    <LotusMark className="h-7 w-7" />
                  </span>
                  <p className="font-serif text-2xl text-ivory-50">A message from our chairman</p>
                  <p className="max-w-sm text-sm text-ivory-300">A short film from the chairman will appear here, with captions and a transcript.</p>
                </div>
              )}
            </div>
          </div>

          {court?.show && court.heading && (
            <aside aria-labelledby="court-title" className="reveal lg:col-span-5 lg:col-start-8">
              <div className="rounded-3xl border border-white/15 bg-ivory-50 p-7 text-charcoal-900 sm:p-9">
                <p className="eyebrow">Notice from the trustees</p>
                <h3 id="court-title" className="mt-3 text-3xl">
                  {court.heading}
                </h3>
                {court.subheading && <p className="mt-3 font-semibold text-charcoal-800">{court.subheading}</p>}
                {court.body && <p className="mt-4 whitespace-pre-line text-charcoal-700">{court.body}</p>}
                {mediaUrl(court.pdf as Media) && (
                  <a href={mediaUrl(court.pdf as Media)!} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-charcoal-900 px-6 font-semibold text-white hover:bg-charcoal-700" download>
                    <FileText aria-hidden="true" className="h-5 w-5" />
                    {court.pdfLabel || 'Download PDF'}
                    <span className="sr-only"> (court report, PDF)</span>
                  </a>
                )}
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* 4. The vision */}
      <section id="vision" aria-labelledby="vision-title" className="bg-ivory-100 py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading eyebrow="The vision" id="vision-title" title="The new Mandir, on the same site" intro={appeal.visionIntro} />
          <figure className="reveal relative overflow-hidden rounded-3xl bg-charcoal-900 shadow-2xl shadow-charcoal-900/20">
            {visuals[0] ? (
              <div className="relative aspect-[16/9]">
                <Image src={mediaUrl(visuals[0].image as Media, 'hero')!} alt={mediaAlt(visuals[0].image as Media, "Artist's impression of the new Mandir")} fill sizes="100vw" className="object-cover" />
              </div>
            ) : (
              <ConceptMandir className="aspect-[16/10] h-auto w-full sm:aspect-[16/9]" />
            )}
            <ArtistsImpressionLabel className="absolute left-4 top-4 sm:left-6 sm:top-6" />
            <figcaption className="border-t border-white/10 bg-charcoal-900 px-6 py-4 text-sm text-ivory-200">
              {visuals[0]?.caption ?? 'An early concept to show the spirit of the new Mandir: a shikhara over the sanctum, a welcoming hall and classrooms. The design will be developed with a temple architect.'}
            </figcaption>
          </figure>
          <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="reveal lg:col-span-5">
              <h3 className="text-3xl">Spaces for worship, learning and seva</h3>
              <ul className="mt-6 space-y-4">
                {(appeal.spaces ?? []).map((s) => (
                  <li key={s.name} className="flex gap-4">
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rotate-45 bg-kumkum-600" aria-hidden="true" />
                    <span>
                      <span className="font-semibold">{s.name}</span>
                      {s.description && <span className="block text-charcoal-600">{s.description}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal card relative p-4 lg:col-span-7">
              <ConceptPlan spaces={appeal.spaces ?? []} />
              <ArtistsImpressionLabel className="absolute right-4 top-4 !bg-kumkum-800" />
            </div>
          </div>
        </div>
      </section>

      <JaaliBand className="bg-ivory-100" />

      {/* 5. Progress and target */}
      <section id="progress" aria-labelledby="progress-title" className="bg-ivory-200/70 py-20 sm:py-28">
        <div className="container-page grid gap-14 lg:grid-cols-12">
          <div className="reveal lg:col-span-6">
            <p className="eyebrow mb-3">Progress and target</p>
            <h2 id="progress-title" className="text-4xl sm:text-5xl">
              Together towards {formatGBP(totals.target)}
            </h2>
            <div className="card mt-8 p-7 sm:p-9">
              <AppealProgress raised={totals.raised} target={totals.target} donors={totals.donors} stageLabel={appeal.stageLabel} />
              <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-ivory-300 pt-6 text-sm">
                <div>
                  <dt className="text-charcoal-500">Build budget</dt>
                  <dd className="mt-1 font-semibold">{appeal.buildBudgetPence ? formatGBP(appeal.buildBudgetPence) : appeal.stageLabel || 'Vision stage'}</dd>
                </div>
                <div>
                  <dt className="text-charcoal-500">Timeline</dt>
                  <dd className="mt-1 font-semibold">{appeal.timelineText || appeal.stageLabel || 'Vision stage'}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="reveal lg:col-span-5 lg:col-start-8">
            <h3 className="text-2xl">Milestones</h3>
            <ol className="relative mt-6 space-y-8 border-l-2 border-ivory-400 pl-8">
              {(appeal.milestones ?? []).map((m) => (
                <li key={m.title} className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[2.6rem] top-1 grid h-5 w-5 place-items-center rounded-full border-2 ${m.status === 'done' ? 'border-kumkum-700 bg-kumkum-700' : m.status === 'current' ? 'border-kumkum-700 bg-ivory-50 ring-4 ring-kumkum-100' : 'border-ivory-400 bg-ivory-50'}`}
                  />
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
        </div>
      </section>

      {/* 6. Be part of it */}
      <section id="join" aria-labelledby="join-title" className="bg-ivory-100 py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading eyebrow="Be part of it" id="join-title" title="Every gift lays a stone" intro="Give once or monthly in under a minute, add Gift Aid at no cost to you, or sponsor part of the Mandir in your family's name." />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Gift, title: 'One-off gift', text: 'Card, Apple Pay or Google Pay with an instant receipt.', href: '/donate', cta: 'Give now' },
              { icon: Repeat, title: 'Give monthly', text: 'By Direct Debit or card. Steady support that lets us plan.', href: '/donate?frequency=monthly', cta: 'Give monthly' },
              { icon: Landmark, title: 'Sponsor a brick, pillar or day', text: 'Dedicate part of the new Mandir in a loved one’s name.', href: '/donate/sponsor', cta: 'See sponsorships' },
              { icon: HeartHandshake, title: 'Pledge a major gift', text: 'Spread a larger gift over time, with a trustee as your contact.', href: '/donate/pledge', cta: 'Make a pledge' },
            ].map(({ icon: Icon, title, text, href, cta }) => (
              <li key={title} className="card relative flex flex-col p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-kumkum-50 text-kumkum-700">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-serif text-2xl">{title}</h3>
                <p className="mt-2 flex-1 text-charcoal-600">{text}</p>
                <Link href={href} className="mt-5 font-semibold text-kumkum-800 after:absolute after:inset-0 hover:underline">
                  {cta} →
                </Link>
              </li>
            ))}
          </ul>

          {sponsorships.docs.length > 0 && (
            <div className="reveal mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-gold-300 bg-gold-300/15 px-6 py-5">
              <p className="mr-2 font-semibold">Sponsor in your family&apos;s name:</p>
              {sponsorships.docs.map((s) => (
                <Link key={s.id} href={`/donate/sponsor#item-${s.id}`} className="rounded-full border border-gold-400 bg-ivory-50 px-4 py-2 text-sm font-semibold text-charcoal-800 hover:border-kumkum-700">
                  {s.name} · {formatGBP(s.amount)}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <div className="reveal card flex items-start gap-5 p-6 lg:col-span-2">
              <ShieldCheck aria-hidden="true" className="mt-1 h-8 w-8 shrink-0 text-kumkum-700" />
              <div>
                <h3 className="font-serif text-2xl">Gift Aid adds 25%</h3>
                <p className="mt-1 text-charcoal-600">
                  If you are a UK taxpayer, tick Gift Aid when you give and HMRC adds 25p to every £1 — so a £100 gift becomes £125 for the new Mandir, at no extra cost to you.
                </p>
              </div>
            </div>
            <div className="reveal card flex items-start gap-5 p-6">
              <Users aria-hidden="true" className="mt-1 h-8 w-8 shrink-0 text-kumkum-700" />
              <div>
                <h3 className="font-serif text-2xl">Give your time</h3>
                <p className="mt-1 text-charcoal-600">Builders, architects, cooks, teachers and organisers — your skills matter.</p>
                <ArrowLink href="/volunteer">Offer to volunteer</ArrowLink>
              </div>
            </div>
          </div>

          {gofundme?.show && gofundme.url && (
            <div className="reveal mt-8 grid items-center gap-6 rounded-3xl border border-ivory-300 bg-ivory-50 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
              <div>
                <p className="eyebrow">Separate appeal</p>
                <h3 className="mt-2 font-serif text-3xl">{gofundme.heading || 'Help Our Cause'}</h3>
                {gofundme.body && <p className="mt-2 max-w-2xl whitespace-pre-line text-charcoal-700">{gofundme.body}</p>}
                <p className="mt-2 text-sm text-charcoal-500">This GoFundMe appeal funds the legal fight and is separate from gifts to the new Mandir.</p>
                <a href={gofundme.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full border border-charcoal-400 px-6 font-semibold hover:bg-ivory-200">
                  Please Donate on GoFundMe<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
              {mediaUrl(gofundme.qrImage as Media) ? (
                <Image src={mediaUrl(gofundme.qrImage as Media, 'card')!} alt="QR code for the Bharat Hindu Samaj Legal Fund on GoFundMe" width={180} height={180} className="rounded-2xl" />
              ) : (
                <QrCode aria-hidden="true" className="h-24 w-24 text-charcoal-400" />
              )}
            </div>
          )}

          {strip.length > 0 && (
            <div className="mt-16">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <h3 className="text-3xl">{fundraisingEvents.length ? 'Fundraising events' : 'Coming up at the Mandir'}</h3>
                <ArrowLink href="/events">All events</ArrowLink>
              </div>
              <ul className="grid gap-5 md:grid-cols-3">
                {strip.map((e) => (
                  <li key={e.id}>
                    <EventCard event={e} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <JaaliBand className="bg-ivory-100" />

      {/* 7. Voices and trust */}
      <section aria-labelledby="voices-title" className="bg-ivory-200/70 py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading eyebrow="Voices and trust" id="voices-title" title="In the words of our community" />
          {voices.length > 0 && (
            <ul className="grid gap-5 md:grid-cols-3">
              {voices.map((v) => (
                <li key={v.name} className="card flex flex-col p-7">
                  <span aria-hidden="true" className="font-serif text-6xl leading-none text-gold-400">
                    “
                  </span>
                  <blockquote className="-mt-4 flex-1 font-serif text-xl leading-snug text-charcoal-800">{v.quote}</blockquote>
                  <p className="mt-5 font-semibold">{v.name}</p>
                  {v.role && <p className="text-sm text-charcoal-500">{v.role}</p>}
                </li>
              ))}
            </ul>
          )}
          <div className="reveal mt-12 grid gap-8 rounded-3xl border border-ivory-300 bg-ivory-50 p-7 sm:p-10 lg:grid-cols-3">
            <div>
              <h3 className="font-serif text-2xl">Our trustees</h3>
              <ul className="mt-3 space-y-1 text-charcoal-700">
                {(governance.trustees ?? []).map((t) => (
                  <li key={t.name}>
                    {t.name}
                    {t.role ? <span className="text-charcoal-500"> · {t.role}</span> : null}
                  </li>
                ))}
              </ul>
              <ArrowLink href="/committee">Committee & trustees</ArrowLink>
            </div>
            <div>
              <h3 className="font-serif text-2xl">How your gift is held</h3>
              <p className="mt-3 whitespace-pre-line text-charcoal-700">{governance.fundsStatement}</p>
            </div>
            <div>
              <h3 className="font-serif text-2xl">A registered charity</h3>
              <p className="mt-3 text-charcoal-700">
                Bharat Hindu Samaj is registered with the Charity Commission for England and Wales, number <strong>{settings.charityNumber}</strong>. Our accounts are audited every year and published.
              </p>
              <ArrowLink href="/governance">Governance & accounts</ArrowLink>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
