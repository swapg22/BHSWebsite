'use client'

import { useState } from 'react'
import { EngravingDefs, useSvgId } from './Motifs'

/**
 * "Anatomy of a Mandir": an engraved elevation of a traditional North Indian (nagara) temple with
 * numbered parts. The list of buttons is the accessible control; the numbered markers on the
 * drawing mirror it for pointer users. This is a teaching illustration of a traditional form,
 * not the design of the new Mandir.
 */
export const MANDIR_PARTS = [
  { name: 'Shikhara', hi: 'शिखर', x: 400, y: 190, text: 'The tower over the sanctum, rising like the sacred mountain Meru. In the nagara style of North India it curves inward as it climbs, banded with carved tiers and smaller echoing spires.' },
  { name: 'Amalaka', hi: 'आमलक', x: 452, y: 84, text: 'The ribbed stone disc that crowns the tower, named after the amla fruit it resembles.' },
  { name: 'Kalasha', hi: 'कलश', x: 400, y: 48, text: 'The sacred pot-shaped finial at the very top. Its consecration, the kumbhabhishekam, completes a new temple.' },
  { name: 'Dhvaja', hi: 'ध्वज', x: 436, y: 14, text: 'The saffron flag flown from the summit, announcing the presence of the temple and renewed on festival days.' },
  { name: 'Garbhagriha', hi: 'गर्भगृह', x: 400, y: 392, text: 'The “womb chamber”: the small, quiet sanctum where the murtis are installed. Everything in the Mandir leads here.' },
  { name: 'Antarala', hi: 'अन्तराल', x: 282, y: 330, text: 'The vestibule between the hall and the sanctum, where devotees pause for darshan.' },
  { name: 'Mandapa', hi: 'मण्डप', x: 165, y: 300, text: 'The pillared hall for gathering together: aarti, bhajans, katha and festivals.' },
  { name: 'Jagati', hi: 'जगती', x: 90, y: 474, text: 'The raised platform the temple stands on, lifting it above everyday ground. Devotees climb its steps to enter.' },
  { name: 'Pradakshina patha', hi: 'प्रदक्षिणा पथ', x: 520, y: 448, text: 'The walkway around the sanctum, walked clockwise in devotion, keeping the deity always to one’s right.' },
] as const

export function MandirAnatomy() {
  const [active, setActive] = useState(0)
  const part = MANDIR_PARTS[active]
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
      <figure className="relative lg:col-span-7">
        <MandirElevation active={active} onPick={setActive} className="h-auto w-full text-charcoal-900" />
        <figcaption className="mt-2 text-center text-sm text-charcoal-500">Engraved illustration of a traditional nagara-style Mandir — not the design of our new Mandir.</figcaption>
      </figure>
      <div className="lg:col-span-5">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
          {MANDIR_PARTS.map((p, i) => (
            <li key={p.name}>
              <button
                type="button"
                aria-pressed={active === i}
                aria-controls="anatomy-detail"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={`flex min-h-12 w-full items-center gap-2 rounded-full border px-3 py-2 text-left text-sm font-semibold transition ${active === i ? 'border-kumkum-700 bg-kumkum-700 text-ivory-50 shadow-[var(--shadow-soft)]' : 'border-gold-500/50 bg-ivory-50 text-charcoal-800 hover:border-kumkum-700'}`}
              >
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${active === i ? 'bg-marigold-400 text-kumkum-900' : 'bg-kumkum-50 text-kumkum-800'}`}>{i + 1}</span>
                {p.name}
              </button>
            </li>
          ))}
        </ol>
        <div id="anatomy-detail" aria-live="polite" className="card bookmark mt-5 p-6">
          <p className="flex items-baseline gap-3">
            <span className="font-serif text-3xl text-kumkum-800">{part.name}</span>
            <span lang="hi" className="font-indic text-xl text-gold-700">
              {part.hi}
            </span>
          </p>
          <p className="mt-2 text-charcoal-700">{part.text}</p>
        </div>
      </div>
    </div>
  )
}

/** The engraved elevation itself (also used decoratively without markers). */
export function MandirElevation({ active = -1, onPick, className = '' }: { active?: number; onPick?: (i: number) => void; className?: string }) {
  const id = useSvgId('elev')
  // Shikhara profile: curving inward from the sanctum walls to the amalaka
  const shikhara = 'M 312 300 C 316 220 344 150 372 98 L 428 98 C 456 150 484 220 488 300 Z'
  const bands = Array.from({ length: 9 }, (_, i) => 290 - i * 21)
  const halfWidthAt = (y: number) => {
    // approximate the curve's half-width at height y (300 → 88, 98 → 28)
    const t = (300 - y) / 202
    return 88 - 60 * Math.pow(t, 1.35)
  }
  return (
    <svg viewBox="0 0 600 530" className={className} role="img" aria-label="Elevation of a traditional Hindu temple showing its parts">
      <EngravingDefs id={id} />
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* sky hatching behind the tower */}
        <circle cx="400" cy="170" r="150" fill="#ffc56b" fillOpacity="0.18" stroke="none" />
        {/* jagati platform and steps */}
        <path d="M 30 452 L 570 452 L 570 498 L 30 498 Z" strokeWidth="1.8" fill={`url(#${id}-hatch)`} />
        <path d="M 30 462 L 570 462 M 30 488 L 570 488" strokeWidth="0.9" />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${44 - i * 8} ${452 + i * 16} L ${112 + i * 8} ${452 + i * 16}`} strokeWidth="1.4" />
        ))}
        <path d="M 20 498 L 580 498 L 590 516 L 10 516 Z" strokeWidth="1.6" />

        {/* mandapa: pillared hall with a stepped (phamsana) roof */}
        <path d="M 60 452 L 60 340 L 268 340 L 268 452" strokeWidth="1.6" />
        {[76, 118, 160, 202, 244].map((x) => (
          <g key={x}>
            <path d={`M ${x - 6} 452 L ${x - 6} 352 M ${x + 6} 452 L ${x + 6} 352`} strokeWidth="1.3" />
            <path d={`M ${x - 10} 352 L ${x + 10} 352 L ${x + 6} 344 L ${x - 6} 344 Z`} strokeWidth="1.1" />
            <path d={`M ${x - 10} 440 L ${x + 10} 440`} strokeWidth="1" />
            <circle cx={x} cy={396} r="4" strokeWidth="0.9" />
          </g>
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M ${50 + i * 14} ${340 - i * 16} L ${278 - i * 14} ${340 - i * 16} L ${270 - i * 14} ${330 - i * 16} L ${58 + i * 14} ${330 - i * 16} Z`} strokeWidth="1.3" fill={i % 2 ? `url(#${id}-hatch)` : 'none'} />
        ))}
        <path d="M 120 260 Q 164 236 208 260" strokeWidth="1.3" />
        <path d="M 156 246 Q 164 226 172 246 M 164 226 L 164 214" strokeWidth="1.2" />

        {/* antarala */}
        <path d="M 268 452 L 268 324 L 312 324 L 312 452" strokeWidth="1.6" />
        <path d="M 262 324 L 318 324 L 306 304 L 274 304 Z" strokeWidth="1.3" />
        <path d="M 280 452 L 280 372 Q 290 356 300 372 L 300 452" strokeWidth="1.2" />

        {/* garbhagriha walls with niches */}
        <path d="M 312 452 L 312 300 L 488 300 L 488 452" strokeWidth="1.8" />
        <path d="M 312 312 L 488 312" strokeWidth="1" />
        {[338, 400, 462].map((x) => (
          <g key={x}>
            <path d={`M ${x - 16} 440 L ${x - 16} 352 Q ${x} 330 ${x + 16} 352 L ${x + 16} 440`} strokeWidth="1.2" />
            <path d={`M ${x - 8} 432 L ${x - 8} 372 Q ${x} 360 ${x + 8} 372 L ${x + 8} 432`} strokeWidth="0.9" fill={`url(#${id}-xhatch)`} />
          </g>
        ))}

        {/* shikhara with tiers and side spires (urushringas) */}
        <path d={shikhara} strokeWidth="2" fill="currentColor" fillOpacity="0.04" />
        {bands.map((y) => {
          const w = halfWidthAt(y)
          return <path key={y} d={`M ${400 - w} ${y} Q 400 ${y + 5} ${400 + w} ${y}`} strokeWidth="0.9" />
        })}
        <path d="M 400 300 L 400 100" strokeWidth="0.8" strokeDasharray="2 4" />
        {[-1, 1].map((s) => (
          <g key={s}>
            <path d={`M ${400 + s * 88} 300 C ${400 + s * 90} 262 ${400 + s * 82} 234 ${400 + s * 70} 214 C ${400 + s * 58} 234 ${400 + s * 54} 262 ${400 + s * 56} 300`} strokeWidth="1.3" fill={`url(#${id}-hatch)`} />
            <ellipse cx={400 + s * 70} cy={212} rx="9" ry="3.5" strokeWidth="1" />
          </g>
        ))}
        {/* amalaka, kalasha and dhvaja */}
        <ellipse cx="400" cy="90" rx="36" ry="10" strokeWidth="1.8" fill="#ffc56b" fillOpacity="0.3" />
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={i} x1={368 + i * 6.4} y1={82} x2={368 + i * 6.4} y2={98} strokeWidth="0.8" />
        ))}
        <path d="M 384 80 L 416 80 L 410 72 L 390 72 Z" strokeWidth="1.3" />
        <path d="M 388 72 Q 380 56 392 48 L 408 48 Q 420 56 412 72 Z" strokeWidth="1.6" fill="#e3a21a" fillOpacity="0.55" />
        <path d="M 396 48 L 396 42 L 404 42 L 404 48 M 400 42 L 400 28" strokeWidth="1.3" />
        <path d="M 400 6 L 400 46" strokeWidth="1.3" />
        <path className="flag-wave" d="M 400 6 L 448 14 L 400 24 Z" fill="#f28a1a" stroke="#c96a06" strokeWidth="1" />

        {/* pradakshina path: a dashed loop around the sanctum */}
        <path d="M 300 470 C 300 482 500 482 500 470" strokeWidth="1.4" strokeDasharray="5 5" stroke="#a31d1d" />
        <path d="M 494 466 L 502 471 L 494 476" strokeWidth="1.4" stroke="#a31d1d" />
      </g>

      {/* numbered markers */}
      {onPick &&
        MANDIR_PARTS.map((p, i) => (
          <g key={p.name} transform={`translate(${p.x} ${p.y})`} onClick={() => onPick(i)} onMouseEnter={() => onPick(i)} className="cursor-pointer" aria-hidden="true">
            {active === i && <circle r="18" fill="#ffa62b" opacity="0.35" className="hotspot-pulse" />}
            <circle r="11" fill={active === i ? '#a31d1d' : '#fbf7ef'} stroke="#a31d1d" strokeWidth="1.6" />
            <text textAnchor="middle" dy="4" fontSize="12" fontWeight="700" fill={active === i ? '#fbf7ef' : '#a31d1d'} style={{ fontFamily: 'var(--font-sans)' }}>
              {i + 1}
            </text>
          </g>
        ))}
    </svg>
  )
}
