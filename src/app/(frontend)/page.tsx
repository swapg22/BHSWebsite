import Image from 'next/image'
import Link from 'next/link'
import { FileText, HeartHandshake, Landmark, Repeat, Gift, Users, ShieldCheck, ChevronDown, ExternalLink } from 'lucide-react'
import type { Media } from '@/payload-types'
import { getAppeal, getGovernance, getHome, getPayloadClient, getSettings, getTimes, mediaAlt, mediaUrl } from '@/lib/data'
import { getAppealTotals } from '@/lib/reports'
import { formatGBP } from '@/lib/money'
import { LotusMark, SectionHeading } from '@/components/ui'
import { ArrowLink } from '@/components/shared'
import { TempleHero } from '@/components/home/TempleHero'
import { WhatsOnTicker } from '@/components/home/WhatsOnTicker'
import { ProgressMarker } from '@/components/home/ProgressMarker'
import { CountUp } from '@/components/temple/CountUp'
import { EngravedBackdrop, MarigoldToran, RangoliBand } from '@/components/temple/Motifs'
import { NewMandirHero } from '@/components/temple/NewMandirHero'

export const revalidate = 300

export default async function HomePage() {
  const payload = await getPayloadClient()
  const [home, appeal, governance, times, settings, totals, sponsorships] = await Promise.all([
    getHome(),
    getAppeal(),
    getGovernance(),
    getTimes(),
    getSettings(),
    getAppealTotals(payload),
    payload.find({ collection: 'sponsorship-items', where: { active: { equals: true } }, sort: 'sortOrder', limit: 4, depth: 0 }),
  ])
  const heroUrl = mediaUrl(home.heroImage as Media, 'hero') ?? '/images/ram-darbar.jpg'
  const heroAlt = mediaAlt(home.heroImage as Media, 'The murtis of Shree Ram, Sita and Lakshman in the Mandir, dressed in yellow and red')
  const court = appeal.courtNotice
  const gofundme = appeal.gofundme
  const voices = (home.voices ?? []).filter((v) => v.consent)

  return (
    <>
      <ProgressMarker />

      {/* 1. Welcome: darshan inside today's Mandir, with times */}
      <TempleHero image={heroUrl} alt={heroAlt} heading={home.heroHeading || 'Celebrating 50 years of Bharat Hindu Samaj'} times={times} />
      <WhatsOnTicker ticker={home.ticker} />

      {/* Notice from the trustees: the High Court case (wording unchanged, kept compact) */}
      {court?.show && court.heading && (
        <section aria-labelledby="court-title" className="bg-ivory-100">
          <div className="container-page py-5">
            <div className="flex flex-col gap-4 rounded-2xl border-l-4 border-kumkum-700 bg-ivory-50 px-5 py-4 shadow-[var(--shadow-soft)] lg:flex-row lg:items-center lg:gap-8">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-kumkum-800">Notice from the trustees</p>
                <h2 id="court-title" className="mt-1 font-serif text-2xl text-charcoal-900">
                  {court.heading}
                </h2>
                {court.subheading && <p className="text-sm font-semibold text-charcoal-700">{court.subheading}</p>}
                {court.body && (
                  <details className="group mt-2">
                    <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 font-semibold text-kumkum-800 hover:underline [&::-webkit-details-marker]:hidden">
                      Read the full notice <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-2 max-w-3xl whitespace-pre-line text-charcoal-700">{court.body}</p>
                  </details>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {mediaUrl(court.pdf as Media) && (
                  <a href={mediaUrl(court.pdf as Media)!} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-kumkum-700 px-5 text-sm font-semibold text-white hover:bg-kumkum-800" download>
                    <FileText aria-hidden="true" className="h-4 w-4" />
                    {court.pdfLabel || 'Download PDF'}
                    <span className="sr-only"> (court report, PDF)</span>
                  </a>
                )}
                {gofundme?.show && gofundme.url && (
                  <a href={gofundme.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-kumkum-700 px-5 text-sm font-semibold text-kumkum-800 hover:bg-kumkum-50">
                    {gofundme.heading || 'Help Our Cause'}: legal fund on GoFundMe
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                    <span className="sr-only"> (opens in a new tab; separate from gifts to the new Mandir)</span>
                  </a>
                )}
                {gofundme?.show && mediaUrl(gofundme.qrImage as Media) && (
                  <Image src={mediaUrl(gofundme.qrImage as Media, 'card')!} alt="QR code for the Bharat Hindu Samaj Legal Fund on GoFundMe" width={72} height={72} className="hidden rounded-lg sm:block" />
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Our community today */}
      <section id="community" aria-labelledby="community-title" className="bg-saffron-wash relative overflow-hidden pb-6 sm:pb-10">
        <EngravedBackdrop className="text-gold-500 opacity-[0.07]" />
        <div className="container-page relative pt-16 sm:pt-20">
          <div className="reveal grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-6">
              <p className="eyebrow mb-3">Our community today</p>
              <h2 id="community-title" className="text-4xl sm:text-5xl">
                Fifty years of worship, <span className="italic text-kumkum-700">service and togetherness</span>
              </h2>
            </div>
            <p className="text-lg text-charcoal-700 lg:col-span-5 lg:col-start-8">
              What began in 1973 with thirty families settling in Peterborough is today a Mandir and community centre serving around a thousand members — open every day, run almost entirely by volunteers.
            </p>
          </div>
          {home.stats && home.stats.length > 0 && (
            <dl className="reveal-stagger relative mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {home.stats.map((s, i) => (
                <div key={s.label} className={`lift relative flex flex-col-reverse overflow-hidden rounded-3xl px-6 py-7 shadow-[0_18px_40px_-22px_rgb(0_0_0/0.8)] ${STAT_TONES[i % STAT_TONES.length]}`}>
                  <span aria-hidden="true" className="absolute -right-6 -top-6 h-20 w-20 rounded-full border border-current opacity-20" />
                  <dt className="mt-2 font-medium opacity-90">{s.label}</dt>
                  <dd className="font-serif text-5xl font-semibold">
                    <CountUp value={s.value} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <ul className="reveal-stagger relative mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
            {(home.activityCards ?? []).map((c) => {
              const img = mediaUrl(c.image as Media, 'card')
              return (
                <li key={c.title}>
                  <Link href={c.href ?? '/activities'} className="torana sheen lift group relative block aspect-[3/4] bg-kumkum-900 ring-2 ring-gold-500/50 hover:ring-marigold-500">
                    {img && <Image src={img} alt="" fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover opacity-90 transition-transform duration-[1.2s] group-hover:scale-110" />}
                    <span className="scrim-bottom absolute inset-0" aria-hidden="true" />
                    <span className="absolute inset-x-0 bottom-0 p-5 text-ivory-50">
                      <span className="block font-serif text-2xl transition-colors group-hover:text-marigold-300">{c.title}</span>
                      {c.text && <span className="mt-1 block text-sm text-ivory-200">{c.text}</span>}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* 3. The new Mandir: the appeal, its progress and the parts of a Mandir */}
      <div id="vision">
        <NewMandirHero id="new-mandir-title" stageLabel={appeal.stageLabel} totals={totals} interactive />
      </div>

      {/* 4. Be part of it */}
      <section id="join" aria-labelledby="join-title" className="relative overflow-hidden bg-ivory-100 pb-16 sm:pb-24">
        <RangoliBand className="h-12 sm:h-14" count={12} />
        <div className="container-page pt-12">
          <SectionHeading eyebrow="Be part of it" id="join-title" title="Every gift lays a stone" intro="Give once or monthly in under a minute, add Gift Aid at no cost to you, or sponsor part of the Mandir in your family's name." />
          <ul className="reveal-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Gift, title: 'One-off gift', text: 'Card, Apple Pay or Google Pay with an instant receipt.', href: '/donate', cta: 'Give now' },
              { icon: Repeat, title: 'Give monthly', text: 'By Direct Debit or card. Steady support that lets us plan.', href: '/donate?frequency=monthly', cta: 'Give monthly' },
              { icon: Landmark, title: 'Sponsor a brick, pillar or day', text: 'Dedicate part of the new Mandir in a loved one’s name.', href: '/donate/sponsor', cta: 'See sponsorships' },
              { icon: HeartHandshake, title: 'Pledge a major gift', text: 'Spread a larger gift over time, with a trustee as your contact.', href: '/donate/pledge', cta: 'Make a pledge' },
            ].map(({ icon: Icon, title, text, href, cta }, i) => (
              <li key={title} className="card bookmark sheen lift relative flex flex-col p-6">
                <span className={`grid h-14 w-14 place-items-center rounded-full ring-4 ring-ivory-50 ${CHIP_TONES[i % CHIP_TONES.length]}`}>
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
            <div className="reveal mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-marigold-400/60 bg-marigold-300/25 px-6 py-5">
              <p className="mr-2 font-semibold">Sponsor in your family&apos;s name:</p>
              {sponsorships.docs.map((s) => (
                <Link key={s.id} href={`/donate/sponsor#item-${s.id}`} className="rounded-full border border-marigold-500 bg-ivory-50 px-4 py-2 text-sm font-semibold text-charcoal-800 transition hover:-translate-y-0.5 hover:border-kumkum-700 hover:bg-white">
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
        </div>
      </section>

      {/* 5. Voices and trust */}
      <section aria-labelledby="voices-title" className="bg-saffron-wash relative overflow-hidden pb-16 sm:pb-24">
        <MarigoldToran className="mb-10 h-12 w-full sm:h-16" swags={8} />
        <div className="container-page">
          <SectionHeading eyebrow="Voices and trust" id="voices-title" title={voices.length ? 'In the words of our community' : 'Run by our community, accountable to you'} />
          {voices.length > 0 && (
            <ul className="reveal-stagger grid gap-5 md:grid-cols-3">
              {voices.map((v) => (
                <li key={v.name} className="card lift flex flex-col border-t-4 !border-t-marigold-400 p-7">
                  <span aria-hidden="true" className="font-serif text-6xl leading-none text-marigold-500">
                    “
                  </span>
                  <blockquote className="-mt-4 flex-1 font-serif text-xl leading-snug text-charcoal-800">{v.quote}</blockquote>
                  <p className="mt-5 font-semibold">{v.name}</p>
                  {v.role && <p className="text-sm text-charcoal-500">{v.role}</p>}
                </li>
              ))}
            </ul>
          )}
          <div className={`reveal grid gap-8 rounded-3xl border border-ivory-300 border-t-4 !border-t-marigold-400 bg-ivory-50 p-7 shadow-[var(--shadow-soft)] sm:p-10 lg:grid-cols-3 ${voices.length ? 'mt-12' : ''}`}>
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
          <p className="mt-10 flex items-center justify-center gap-2 text-center font-serif text-xl text-kumkum-800">
            <LotusMark className="h-6 w-6" /> Jai Shri Ram
          </p>
        </div>
      </section>
    </>
  )
}

// Text colours chosen for WCAG AA on each fill
const STAT_TONES = ['bg-kumkum-700 text-ivory-50', 'bg-marigold-400 text-kumkum-900', 'bg-sindoor-600 text-ivory-50', 'bg-ivory-50 text-kumkum-800 ring-1 ring-gold-500/40']
const CHIP_TONES = ['bg-kumkum-700 text-ivory-50', 'bg-marigold-400 text-kumkum-900', 'bg-sindoor-600 text-ivory-50', 'bg-tulsi-700 text-ivory-50']
