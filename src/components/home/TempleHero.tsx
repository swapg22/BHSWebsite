import { preload } from 'react-dom'
import { Clock, Flame } from 'lucide-react'
import { ButtonLink, LotusMark } from '@/components/ui'
import { EngravedBackdrop, MarigoldToran, ToranaArch } from '@/components/temple/Motifs'
import { PetalShower } from '@/components/temple/Animated'

type Times = { aarti: string; weekdays: string; weekends: string; overrideLabel?: string | null }

/**
 * Home welcome (stage 1), modelled on the current site: darshan of the murtis framed by an
 * engraved torana, with the welcome line and opening and aarti times beside it (never over the
 * deities, section 17). The section is sized to the photograph.
 */
export function TempleHero({ image, alt, heading, times }: { image: string; alt: string; heading: string; times: Times }) {
  // Served through the image optimiser (resized, modern format) and preloaded as the page's main image
  const src = `/_next/image?url=${encodeURIComponent(image)}&w=1200&q=75`
  preload(src, { as: 'image', fetchPriority: 'high' })

  return (
    <section id="today" aria-labelledby="welcome-title" className="bg-festival relative isolate overflow-hidden text-ivory-50">
      <EngravedBackdrop className="text-gold-300 opacity-[0.07]" />
      <PetalShower count={14} />
      <MarigoldToran className="absolute inset-x-0 top-0 z-10 h-10 w-full sm:h-14" swags={8} />

      <div className="container-page relative grid items-center gap-4 pb-4 pt-11 sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:pb-4">
        <div className="mx-auto w-full max-w-[22rem] sm:max-w-[30rem] lg:col-span-6 lg:max-w-none">
          <ToranaArch image={src} alt={alt} className="mx-auto block h-auto max-h-[min(72svh,36rem)] w-full text-gold-300 drop-shadow-[0_20px_40px_rgb(0_0_0/0.45)]" />
        </div>

        <div className="pb-6 text-center lg:col-span-6 lg:pb-0 lg:text-left">
          <p lang="hi" className="animate-fade-up font-indic text-xl font-medium text-marigold-300">
            जय श्री राम
          </p>
          <h1 id="welcome-title" className="mx-auto mt-2 max-w-xl animate-fade-up text-[2.1rem] leading-[1.05] text-white [animation-delay:120ms] sm:text-5xl lg:mx-0">
            {heading}
          </h1>
          <dl className="mx-auto mt-5 grid max-w-xl animate-fade-up gap-px overflow-hidden rounded-2xl border border-gold-300/30 bg-gold-300/20 text-left [animation-delay:240ms] grid-cols-3 lg:mx-0">
            {[
              { icon: Clock, label: 'Weekdays', value: times.weekdays },
              { icon: Clock, label: 'Weekends', value: times.weekends },
              { icon: Flame, label: 'Daily aarti', value: times.aarti },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-kumkum-900/70 px-2.5 py-2.5 sm:px-4 sm:py-3">
                <dt className="flex items-center gap-1.5 text-xs text-gold-300 sm:gap-2 sm:text-sm">
                  <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" /> {label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold leading-snug sm:text-base">{value}</dd>
              </div>
            ))}
          </dl>
          {times.overrideLabel && <p className="mt-3 animate-fade-up text-sm text-gold-300 [animation-delay:300ms]">{times.overrideLabel} times are shown above.</p>}
          <div className="mt-6 flex animate-fade-up flex-wrap justify-center gap-3 [animation-delay:360ms] lg:justify-start">
            <ButtonLink href="/donate" variant="marigold">
              <LotusMark className="h-5 w-5" />
              Donate to the new Mandir
            </ButtonLink>
            <ButtonLink href="/membership" variant="outline-light">
              Join for £20 a year
            </ButtonLink>
            <ButtonLink href="/visit" variant="outline-light">
              Plan your visit
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
