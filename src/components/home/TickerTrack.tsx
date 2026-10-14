'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Pause, Play } from 'lucide-react'

export type TickerItem = { label: string; when?: string; href?: string }

/**
 * Moving strip of notices and events. Moving content can be paused (WCAG 2.2.2): with the
 * button, by hovering or focusing it, and it never moves for reduced-motion users. Only the first
 * copy of the list is exposed to assistive technology; the repeat that makes the loop seamless is
 * hidden and its links are not focusable.
 */
export function TickerTrack({ items }: { items: TickerItem[] }) {
  const [paused, setPaused] = useState(false)
  const row = (copy: boolean) => (
    <ul className="marquee-track flex shrink-0 items-center gap-8 pr-8" aria-hidden={copy || undefined}>
      {items.map((it, i) => {
        const body = (
          <>
            {it.when && <span className="rounded-full bg-kumkum-800 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-marigold-300">{it.when}</span>}
            <span className="font-semibold">{it.label}</span>
          </>
        )
        return (
          <li key={i} className="flex items-center gap-8 whitespace-nowrap">
            {it.href ? (
              <Link href={it.href} tabIndex={copy ? -1 : undefined} className="inline-flex min-h-11 items-center gap-2.5 underline-offset-4 hover:underline">
                {body}
              </Link>
            ) : (
              <span className="inline-flex min-h-11 items-center gap-2.5">{body}</span>
            )}
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-kumkum-700" aria-hidden="true">
              <path d="M12 1 L14.2 9.8 L23 12 L14.2 14.2 L12 23 L9.8 14.2 L1 12 L9.8 9.8 Z" fill="currentColor" />
            </svg>
          </li>
        )
      })}
    </ul>
  )
  return (
    <section aria-label="What's on" className="relative bg-marigold-400 text-kumkum-900">
      <div className="flex items-stretch">
        <p className="relative z-10 flex shrink-0 items-center gap-2 bg-kumkum-700 px-4 font-serif text-lg italic text-ivory-50 sm:px-6">
          What&apos;s on
        </p>
        <div className={`marquee relative flex min-w-0 flex-1 overflow-hidden py-1 ${paused ? 'is-paused' : ''}`}>
          {row(false)}
          {row(true)}
        </div>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="relative z-10 grid w-12 shrink-0 place-items-center bg-marigold-400 text-kumkum-900 hover:bg-marigold-300"
        >
          {paused ? <Play aria-hidden="true" className="h-4 w-4" /> : <Pause aria-hidden="true" className="h-4 w-4" />}
          <span className="sr-only">{paused ? 'Play' : 'Pause'} the what&apos;s on ticker</span>
        </button>
      </div>
    </section>
  )
}
