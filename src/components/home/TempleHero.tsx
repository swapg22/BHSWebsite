import { preload } from 'react-dom'
import { Clock, Flame } from 'lucide-react'
import { ButtonLink, LotusMark } from '@/components/ui'
import { EngravedBackdrop, LotusPond, MarigoldToran, ToranaArch } from '@/components/temple/Motifs'
import { OmMark, PetalShower, RotatingSeal } from '@/components/temple/Animated'

type Times = { aarti: string; weekdays: string; weekends: string }

/**
 * Home welcome (stage 1): darshan of the murtis inside the Mandir, framed by an engraved torana,
 * with the welcome text beside the photograph, never over the deities (section 17).
 */
export function TempleHero({ image, alt, heritageLine, times }: { image: string; alt: string; heritageLine?: string | null; times: Times }) {
  // Served through the image optimiser (resized, modern format) and preloaded as the page's main image
  const src = `/_next/image?url=${encodeURIComponent(image)}&w=1200&q=75`
  preload(src, { as: 'image', fetchPriority: 'high' })

  return (
    <section id="today" aria-labelledby="welcome-title" className="bg-festival relative isolate overflow-hidden text-ivory-50">
      <EngravedBackdrop className="text-gold-300 opacity-[0.07]" />
      <PetalShower count={18} />
      <MarigoldToran className="absolute inset-x-0 top-0 z-10 h-14 w-full sm:h-20" swags={7} />

      <div className="container-page relative grid items-center gap-8 pb-10 pt-20 sm:pt-24 lg:grid-cols-12 lg:gap-6 lg:pb-16 lg:pt-28">
        <div className="relative mx-auto w-full max-w-[34rem] lg:order-2 lg:col-span-7 lg:-mr-6 lg:max-w-none">
          <ToranaArch image={src} alt={alt} className="h-auto w-full text-gold-300 drop-shadow-[0_20px_40px_rgb(0_0_0/0.45)]" />
          <RotatingSeal text="SHREE RAM MANDIR · PETERBOROUGH · 1973 · " className="absolute -bottom-3 right-0 h-24 w-24 text-gold-300 sm:h-32 sm:w-32 lg:-left-6 lg:right-auto">
            <OmMark className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-kumkum-800 text-3xl text-gold-300 ring-1 ring-gold-300/60" />
          </RotatingSeal>
        </div>

        <div className="lg:order-1 lg:col-span-5">
          <p className="eyebrow animate-fade-up !text-gold-300 before:!bg-gold-300">{heritageLine ?? 'Serving Peterborough since 1973'}</p>
          <p lang="hi" className="mt-4 animate-fade-up font-indic text-2xl font-medium text-marigold-300 [animation-delay:100ms] sm:text-3xl">
            भारत हिन्दू समाज · श्री राम मंदिर
          </p>
          <h1 id="welcome-title" className="mt-2 animate-fade-up text-5xl leading-[0.98] text-white [animation-delay:180ms] sm:text-7xl lg:text-7xl 2xl:text-8xl">
            Bharat Hindu Samaj
            <span className="text-gradient-gold mt-2 block text-[0.55em] italic leading-tight">Shree Ram Mandir, Peterborough</span>
          </h1>
          <p className="mt-6 max-w-xl animate-fade-up text-lg text-ivory-100 [animation-delay:300ms] sm:text-xl">
            Peterborough&apos;s Hindu temple and community centre — a home for worship, festivals and friendship for over fifty years, and now the beginning of a new Mandir.
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap gap-3 [animation-delay:420ms]">
            <ButtonLink href="/donate" size="lg" variant="marigold">
              <LotusMark className="h-5 w-5" />
              Donate to the new Mandir
            </ButtonLink>
            <ButtonLink href="/membership" size="lg" variant="outline-light">
              Join for £20 a year
            </ButtonLink>
          </div>
          <dl className="mt-10 grid max-w-2xl animate-fade-up gap-px overflow-hidden rounded-2xl border border-gold-300/30 bg-gold-300/20 [animation-delay:540ms] sm:grid-cols-3">
            {[
              { icon: Flame, label: 'Daily aarti', value: times.aarti },
              { icon: Clock, label: 'Weekdays', value: times.weekdays },
              { icon: Clock, label: 'Weekends', value: times.weekends },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-kumkum-900/70 px-5 py-4">
                <dt className="flex items-center gap-2 text-sm text-gold-300">
                  <Icon aria-hidden="true" className="h-4 w-4" /> {label}
                </dt>
                <dd className="mt-1 text-lg font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <LotusPond className="relative block h-16 w-full text-gold-300/70 sm:h-24" />
    </section>
  )
}
