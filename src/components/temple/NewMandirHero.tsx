import { formatGBP } from '@/lib/money'
import { ButtonLink, LotusMark } from '@/components/ui'
import { AppealProgress, ArtistsImpressionLabel } from '@/components/shared'
import { EngravedBackdrop, LotusPond, MarigoldToran, Stars, TempleSkyline } from './Motifs'
import { MandirAnatomy, MandirElevation } from './MandirAnatomy'
import { PetalShower } from './Animated'

/**
 * The opening of the new Mandir story. On the New Mandir page it is the page header (h1) with the
 * engraved elevation; on the home page (`interactive`) it is one combined section: the appeal, its
 * progress, and the interactive picture explaining each part of a Mandir, set against a dusk sky.
 */
export function NewMandirHero({
  as: Heading = 'h2',
  id,
  stageLabel,
  totals,
  interactive = false,
}: {
  as?: 'h1' | 'h2'
  id: string
  stageLabel?: string | null
  totals: { raised: number; target: number; donors: number }
  interactive?: boolean
}) {
  return (
    <section aria-labelledby={id} className={`${interactive ? 'bg-sunset' : 'bg-festival'} relative isolate overflow-hidden text-ivory-50`}>
      {interactive ? <Stars count={18} className="top-[320px] h-[40%]" /> : <EngravedBackdrop className="text-gold-300 opacity-[0.06]" />}
      <PetalShower count={interactive ? 8 : 10} />
      {interactive && (
        <>
          <TempleSkyline className="pointer-events-none absolute inset-x-0 top-[120px] h-[110px] w-full text-[#7a1616]/70 sm:top-[130px] sm:h-[140px]" />
          <LotusPond className="pointer-events-none absolute inset-x-0 bottom-[70px] h-20 w-full text-marigold-300/70 sm:h-24" />
        </>
      )}
      {!interactive && <MarigoldToran className="absolute inset-x-0 top-0 z-10 h-12 w-full sm:h-16" swags={7} />}
      <div className={`container-page relative grid gap-10 lg:grid-cols-12 ${interactive ? 'items-start pb-64 pt-60 sm:pb-72 sm:pt-64' : 'items-center pb-6 pt-20 lg:pt-24'}`}>
        <div className={interactive ? 'lg:sticky lg:top-28 lg:col-span-5' : 'lg:col-span-6'}>
          <div className="mb-6">
            <ArtistsImpressionLabel />
          </div>
          <p className="eyebrow !text-gold-300 before:!bg-gold-300">The new Mandir · {stageLabel ?? 'Vision stage'}</p>
          <p lang="hi" className="mt-3 font-indic text-2xl text-marigold-300 sm:text-3xl">
            नया मंदिर · आने वाली पीढ़ियों के लिए
          </p>
          <Heading id={id} className="mt-2 text-5xl text-white sm:text-6xl">
            A Mandir for the <span className="text-gradient-gold italic">next fifty years</span>
          </Heading>
          <p className="mt-5 max-w-xl text-lg text-ivory-100">
            Same name, same site, a new home for worship, learning and seva: a sanctum beneath a shikhara, a prayer hall, a hall for 500, a kitchen and dining hall, a library and room to park. Every gift lays a stone towards {formatGBP(totals.target)}.
          </p>
          {interactive && (
            <div className="mt-6 max-w-xl rounded-2xl bg-ivory-50 p-5 text-charcoal-900 shadow-[0_20px_50px_-24px_rgb(0_0_0/0.7)]">
              <AppealProgress raised={totals.raised} target={totals.target} donors={totals.donors} stageLabel={stageLabel} />
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/donate" size="lg" variant="marigold">
              <LotusMark className="h-5 w-5" />
              Give to the new Mandir
            </ButtonLink>
            <ButtonLink href={interactive ? '/new-mandir' : '/donate/sponsor'} size="lg" variant="outline-light">
              {interactive ? 'See the plans' : 'Sponsor a brick or pillar'}
            </ButtonLink>
          </div>
        </div>
        <div className={`relative ${interactive ? 'lg:col-span-7' : 'lg:col-span-6'}`}>
          <div aria-hidden="true" className="absolute inset-x-8 bottom-8 top-4 rounded-full bg-[radial-gradient(closest-side,rgb(255_166_43/0.35),transparent)]" />
          {interactive ? (
            <div className="relative">
              <MandirAnatomy tone="dark" />
            </div>
          ) : (
            <MandirElevation className="relative h-auto w-full text-gold-300 drop-shadow-[0_10px_30px_rgb(0_0_0/0.4)]" />
          )}
        </div>
      </div>
      {!interactive && <LotusPond className="relative block h-14 w-full text-gold-300/70 sm:h-20" />}
    </section>
  )
}
