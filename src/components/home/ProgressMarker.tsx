'use client'

import { useEffect, useState } from 'react'

const STAGES = [
  { id: 'today', label: 'Today' },
  { id: 'seva', label: 'Seva' },
  { id: 'vision', label: 'New Mandir' },
  { id: 'join', label: 'Join' },
]

/** Fixed progress marker for the home page journey (spec section 4 behaviour). */
export function ProgressMarker() {
  const [active, setActive] = useState('today')
  useEffect(() => {
    const els = STAGES.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <nav aria-label="Journey" className="no-print fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
      <ol className="flex flex-col gap-1 rounded-full border border-ivory-300/70 bg-ivory-50/85 p-2 shadow-lg backdrop-blur">
        {STAGES.map((s, i) => {
          const on = active === s.id
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={on ? 'step' : undefined}
                className={`group flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors ${on ? 'bg-kumkum-700 text-white' : 'text-charcoal-600 hover:bg-ivory-200'}`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${on ? 'bg-white/20' : 'bg-ivory-200 text-charcoal-700'}`}>{i + 1}</span>
                {s.label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
