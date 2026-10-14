/**
 * Motion pieces for the vibrant redesign. All are CSS-driven (no animation library), stop for
 * reduced-motion users (see styles.css), and are decorative unless stated otherwise.
 */
import type { ReactNode } from 'react'

/** Festival marquee in Devanagari and English, like a garland of names. Pauses on hover. */
export function FestivalMarquee({ items, className = '' }: { items: { en: string; hi?: string }[]; className?: string }) {
  const row = (hidden: boolean) => (
    <ul className="marquee-track flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-10 whitespace-nowrap">
          <span className="flex items-baseline gap-3">
            {it.hi && (
              <span lang="hi" className="font-indic text-2xl font-semibold sm:text-3xl">
                {it.hi}
              </span>
            )}
            <span className="font-serif text-2xl italic sm:text-3xl">{it.en}</span>
          </span>
          <MarqueeStar />
        </li>
      ))}
    </ul>
  )
  return (
    <div className={`marquee group relative flex overflow-hidden ${className}`}>
      {row(false)}
      {row(true)}
    </div>
  )
}

function MarqueeStar() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M12 1 L14.2 9.8 L23 12 L14.2 14.2 L12 23 L9.8 14.2 L1 12 L9.8 9.8 Z" fill="currentColor" />
    </svg>
  )
}

/** Slowly turning circular inscription with a centre emblem (like a temple seal). */
export function RotatingSeal({ text, children, className = '' }: { text: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`relative grid place-items-center ${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 200" className="seal-spin absolute inset-0 h-full w-full">
        <defs>
          <path id="seal-circle" d="M 100 100 m -78 0 a 78 78 0 1 1 156 0 a 78 78 0 1 1 -156 0" />
        </defs>
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <text fontSize="14" letterSpacing="2.6" fill="currentColor" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
          <textPath href="#seal-circle">{text}</textPath>
        </text>
      </svg>
      <div className="relative">{children}</div>
    </div>
  )
}

/** Om symbol, used as the seal's centre and elsewhere as a small ornament. */
export function OmMark({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <span lang="sa" className={`grid place-items-center font-indic leading-none ${className}`}>
      ॐ
    </span>
  )
}

/** Marigold petals drifting down: deterministic positions so server and client match. */
export function PetalShower({ count = 16, className = '' }: { count?: number; className?: string }) {
  const petals = Array.from({ length: count }, (_, i) => {
    const left = (i * 61) % 100
    const delay = ((i * 37) % 90) / 10
    const duration = 9 + ((i * 13) % 7)
    const size = 8 + ((i * 7) % 9)
    const hue = i % 3 === 0 ? '#ffc56b' : i % 3 === 1 ? '#f28a1a' : '#d7261e'
    return { left, delay, duration, size, hue, drift: i % 2 ? 40 : -40 }
  })
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 1.4,
              background: p.hue,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--drift': `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

/** A scalloped (temple-arch) edge between two coloured sections. `color` is the colour below. */
export function ScallopEdge({ className = '', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className={`block h-6 w-full sm:h-10 ${flip ? 'rotate-180' : ''} ${className}`} aria-hidden="true">
      <path
        fill="currentColor"
        d={`M0 40 L0 30 ${Array.from({ length: 24 }, (_, i) => {
          const x0 = i * 50
          return `Q ${x0 + 12} 30 ${x0 + 18} 16 Q ${x0 + 25} 2 ${x0 + 32} 16 Q ${x0 + 38} 30 ${x0 + 50} 30`
        }).join(' ')} L1200 40 Z`}
      />
    </svg>
  )
}
