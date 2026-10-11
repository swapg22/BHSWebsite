import Image from 'next/image'
import type { Media, Page } from '@/payload-types'
import { mediaAlt, mediaUrl } from '@/lib/data'
import { RichText } from '@/components/shared'
import { ButtonLink } from '@/components/ui'

type Section = NonNullable<Page['sections']>[number]

/** Renders the fixed set of page layouts editors can use; they cannot break the design. */
export function PageSections({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-16 sm:space-y-24">
      {sections.map((s, i) => {
        switch (s.blockType) {
          case 'text':
            return (
              <section key={s.id ?? i} className="reveal">
                {s.heading && <h2 className="mb-5 text-3xl sm:text-4xl">{s.heading}</h2>}
                <RichText data={s.body} className="text-lg text-charcoal-700" />
              </section>
            )
          case 'imageText': {
            const img = mediaUrl(s.image as Media, 'card')
            const deity = (s.image as Media)?.deityImage
            return (
              <section key={s.id ?? i} className="reveal grid items-center gap-10 lg:grid-cols-2">
                <div className={s.imageSide === 'left' ? 'lg:order-2' : ''}>
                  {s.heading && <h2 className="mb-5 text-3xl sm:text-4xl">{s.heading}</h2>}
                  <RichText data={s.body} className="text-lg text-charcoal-700" />
                </div>
                {img && (
                  <figure className={s.imageSide === 'left' ? 'lg:order-1' : ''}>
                    <div className={`relative bg-ivory-200 ${deity ? 'aspect-square overflow-hidden rounded-[var(--radius-panel)] border-8 border-ivory-50' : 'torana aspect-[4/5] sm:aspect-[4/3]'}`}>
                      <Image src={img} alt={mediaAlt(s.image as Media)} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
                    </div>
                    {(s.image as Media)?.caption && <figcaption className="mt-3 text-sm text-charcoal-500">{(s.image as Media).caption}</figcaption>}
                  </figure>
                )}
              </section>
            )
          }
          case 'faq':
            return (
              <section key={s.id ?? i} className="reveal">
                {s.heading && <h2 className="mb-6 text-3xl sm:text-4xl">{s.heading}</h2>}
                <div className="divide-y divide-ivory-300 overflow-hidden rounded-3xl border border-ivory-300 bg-white">
                  {(s.items ?? []).map((item) => (
                    <details key={item.id ?? item.question} className="group">
                      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-serif text-xl text-charcoal-900 hover:bg-ivory-50 [&::-webkit-details-marker]:hidden">
                        {item.question}
                        <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ivory-400 text-kumkum-700 transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="px-6 pb-6 text-lg leading-relaxed text-charcoal-700">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )
          case 'mantra':
            return (
              <section key={s.id ?? i} className="reveal rounded-3xl border border-gold-300 bg-gradient-to-br from-ivory-50 to-gold-300/15 p-7 sm:p-10">
                <h2 className="text-3xl sm:text-4xl">{s.heading}</h2>
                {s.original && (
                  <p lang="sa" className="mt-6 text-2xl leading-relaxed text-kumkum-800 sm:text-3xl">
                    {s.original}
                  </p>
                )}
                {s.transliteration && <p className="mt-5 font-serif text-xl italic leading-relaxed text-charcoal-800">{s.transliteration}</p>}
                {s.meaning && (
                  <div className="mt-6 border-t border-gold-300 pt-5">
                    <p className="eyebrow mb-2">Meaning</p>
                    <p className="text-lg leading-relaxed text-charcoal-700">{s.meaning}</p>
                  </div>
                )}
              </section>
            )
          case 'callToAction':
            return (
              <section key={s.id ?? i} className="reveal flex flex-col items-start justify-between gap-6 rounded-[var(--radius-panel)] bg-midnight-900 p-8 text-ivory-50 sm:flex-row sm:items-center sm:p-10">
                <div>
                  <h2 className="text-3xl text-ivory-50">{s.heading}</h2>
                  {s.text && <p className="mt-2 text-ivory-200">{s.text}</p>}
                </div>
                <ButtonLink href={s.href} size="lg" className="shrink-0">
                  {s.label}
                </ButtonLink>
              </section>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
