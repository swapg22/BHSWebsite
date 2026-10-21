/**
 * Engraved temple motifs (vibrant redesign). Every illustration is inline SVG line-work in the
 * spirit of a copperplate engraving, drawn with temple forms: the torana gateway, deepa stambha
 * lamp pillars, marigold toran garlands, lotus ponds and a fine engraved backdrop.
 * All decorative: aria-hidden unless they carry content.
 */
import { useId } from 'react'

/** A unique, CSS-safe id prefix so a motif can appear more than once on a page. */
export function useSvgId(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, '')
}

const INK = 'currentColor'

/** Points of a cusped (multifoil) arch, the classic Indian temple doorway curve. */
function cuspedArchPath(cx: number, cy: number, r: number, lobes: number, depth: number): string {
  const pts: [number, number][] = []
  for (let i = 0; i <= lobes; i++) {
    const a = Math.PI - (Math.PI * i) / lobes
    pts.push([cx + r * Math.cos(a), cy - r * Math.sin(a)])
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const mx = (x0 + x1) / 2
    const my = (y0 + y1) / 2
    // Pull the control point towards the centre so each lobe curls inward
    const k = depth / Math.hypot(mx - cx, my - cy)
    const qx = mx - (mx - cx) * k
    const qy = my - (my - cy) * k
    d += ` Q ${qx.toFixed(1)} ${qy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`
  }
  return d
}

/** Shared engraving defs: hatching and cross-hatching patterns, and a soft lamp glow. */
export function EngravingDefs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={`${id}-hatch`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="5" stroke={INK} strokeWidth="0.9" opacity="0.55" />
      </pattern>
      <pattern id={`${id}-xhatch`} width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 0 L6 6 M6 0 L0 6" stroke={INK} strokeWidth="0.6" opacity="0.4" />
      </pattern>
      <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#ffd27a" stopOpacity="0.95" />
        <stop offset="0.45" stopColor="#ffa62b" stopOpacity="0.45" />
        <stop offset="1" stopColor="#ffa62b" stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}

/** A single lamp flame (animated flicker via the .diya-flame class). */
function Flame({ x, y, s = 1, delay = 0, id }: { x: number; y: number; s?: number; delay?: number; id: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r="11" fill={`url(#${id}-glow)`} />
      <path className="diya-flame" style={{ animationDelay: `${delay}s` }} d="M0 -12 C 5 -5 5 0 0 3 C -5 0 -5 -5 0 -12Z" fill="#ffd27a" stroke="#ff8a1a" strokeWidth="0.8" />
      <path d="M-6 3 Q0 8 6 3 Q3 6 0 6 Q-3 6 -6 3Z" fill={INK} />
    </g>
  )
}

/**
 * The torana gateway: a cusped arch on carved pillars, crowned with a kalash and hung with bells,
 * standing on a stepped plinth. The arch opening is proportioned for a landscape photograph of the
 * murtis, so the deities are framed rather than cropped. Text never sits over the photograph.
 */
export function ToranaArch({ image, alt, className = '' }: { image?: string; alt?: string; className?: string }) {
  const id = useSvgId('torana')
  const cx = 320
  const cy = 290
  const r = 210
  const floor = 520
  const arch = cuspedArchPath(cx, cy, r, 9, 13)
  const opening = `${arch} L ${cx + r} ${floor} L ${cx - r} ${floor} Z`
  // Photograph sized to the opening's height (landscape images lose only their outer edges)
  const imgH = floor - (cy - r) + 10
  const imgW = imgH * 1.1
  return (
    <svg viewBox="0 -60 640 680" className={className} role={image ? 'img' : undefined} aria-label={image ? alt : undefined} aria-hidden={image ? undefined : true}>
      <EngravingDefs id={id} />
      <linearGradient id={`${id}-curtain`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f6c445" />
        <stop offset="1" stopColor="#c98a12" />
      </linearGradient>
      <clipPath id={`${id}-opening`}>
        <path d={opening} />
      </clipPath>
      <g clipPath={`url(#${id}-opening)`}>
        <rect x={cx - r} y={cy - r} width={2 * r} height={floor - cy + r} fill={`url(#${id}-curtain)`} />
        {image && (
          <image className="torana-photo" href={image} x={cx - imgW / 2} y={floor - imgH} width={imgW} height={imgH} preserveAspectRatio="xMidYMax slice" />
        )}
        {/* warm lamp-light vignette at the edges of the sanctum */}
        <rect x={cx - r} y={cy - r} width={2 * r} height={floor - cy + r} fill={`url(#${id}-vignette)`} />
      </g>
      <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.55" r="0.75">
        <stop offset="0.6" stopColor="#2b0a05" stopOpacity="0" />
        <stop offset="1" stopColor="#2b0a05" stopOpacity="0.55" />
      </radialGradient>

      <g fill="none" stroke={INK} strokeLinecap="round" strokeLinejoin="round" className="engrave-draw">
        {/* arch mouldings with a band of dentils */}
        <path d={arch} strokeWidth="2.6" />
        <path d={cuspedArchPath(cx, cy, r + 14, 9, 0)} strokeWidth="1.2" />
        <path d={cuspedArchPath(cx, cy, r + 42, 9, 0)} strokeWidth="2.2" />
        {Array.from({ length: 41 }).map((_, i) => {
          const a = Math.PI - (Math.PI * i) / 40
          return <line key={i} x1={cx + (r + 18) * Math.cos(a)} y1={cy - (r + 18) * Math.sin(a)} x2={cx + (r + 38) * Math.cos(a)} y2={cy - (r + 38) * Math.sin(a)} strokeWidth="1" />
        })}
        {/* lintel and outer frame */}
        <path d={`M ${cx - r - 70} ${cy} L ${cx - r} ${cy} M ${cx + r} ${cy} L ${cx + r + 70} ${cy}`} strokeWidth="2.4" />
        {/* pillars either side of the opening */}
        {[cx - r - 34, cx + r + 34].map((x) => (
          <g key={x}>
            <path d={`M ${x - 22} ${cy} Q ${x - 27} ${cy - 30} ${x} ${cy - 40} Q ${x + 27} ${cy - 30} ${x + 22} ${cy}`} strokeWidth="1.6" />
            <path d={`M ${x - 15} ${cy - 18} L ${x + 15} ${cy - 18} M ${x - 19} ${cy - 8} L ${x + 19} ${cy - 8}`} strokeWidth="1" />
            <path d={`M ${x - 16} ${cy} L ${x - 16} ${floor - 30} M ${x + 16} ${cy} L ${x + 16} ${floor - 30}`} strokeWidth="1.6" />
            <rect x={x - 16} y={cy + 4} width={32} height={floor - cy - 36} fill={`url(#${id}-hatch)`} stroke="none" />
            {[cy + 70, cy + 150].map((y) => (
              <g key={y}>
                <path d={`M ${x - 16} ${y} Q ${x - 12} ${y - 16} ${x} ${y - 22} Q ${x + 12} ${y - 16} ${x + 16} ${y}`} strokeWidth="1.3" fill="currentColor" fillOpacity="0.08" />
                <path d={`M ${x - 7} ${y} Q ${x} ${y - 12} ${x + 7} ${y}`} strokeWidth="1" />
                <path d={`M ${x - 16} ${y + 4} L ${x + 16} ${y + 4}`} strokeWidth="0.8" />
              </g>
            ))}
            <path d={`M ${x - 24} ${floor - 30} L ${x + 24} ${floor - 30} L ${x + 28} ${floor} L ${x - 28} ${floor} Z`} strokeWidth="1.6" />
            {/* turret (miniature shikhara) above each pillar */}
            <path d={`M ${x - 18} ${cy - 40} Q ${x - 16} ${cy - 84} ${x} ${cy - 108} Q ${x + 16} ${cy - 84} ${x + 18} ${cy - 40}`} strokeWidth="1.4" />
            {[cy - 56, cy - 72, cy - 88].map((y, k) => (
              <path key={y} d={`M ${x - 16 + k * 3} ${y} Q ${x} ${y - 5} ${x + 16 - k * 3} ${y}`} strokeWidth="0.9" />
            ))}
            <circle cx={x} cy={cy - 112} r="4" strokeWidth="1.2" />
          </g>
        ))}
        {/* stepped plinth */}
        <path d={`M ${cx - r - 72} ${floor} L ${cx + r + 72} ${floor}`} strokeWidth="2.4" />
        <path d={`M ${cx - r - 84} ${floor + 18} L ${cx + r + 84} ${floor + 18} M ${cx - r - 72} ${floor} L ${cx - r - 84} ${floor + 18} M ${cx + r + 72} ${floor} L ${cx + r + 84} ${floor + 18}`} strokeWidth="1.6" />
        <path d={`M ${cx - r - 96} ${floor + 38} L ${cx + r + 96} ${floor + 38} M ${cx - r - 84} ${floor + 18} L ${cx - r - 96} ${floor + 38} M ${cx + r + 84} ${floor + 18} L ${cx + r + 96} ${floor + 38}`} strokeWidth="1.6" />
        <rect x={cx - r - 84} y={floor + 20} width={2 * r + 168} height={16} fill={`url(#${id}-xhatch)`} stroke="none" />
        {/* kalash and coconut finial at the apex */}
        <g transform={`translate(${cx} ${cy - r - 64})`}>
          <path d="M -20 22 Q -27 0 -11 -8 L 11 -8 Q 27 0 20 22 Z" strokeWidth="1.8" fill="currentColor" fillOpacity="0.12" />
          <path d="M -13 -8 L -13 -14 L 13 -14 L 13 -8" strokeWidth="1.4" />
          <path d="M 0 -14 Q -11 -30 0 -42 Q 11 -30 0 -14" strokeWidth="1.4" />
          {[-1, 1].map((sx) => (
            <path key={sx} d={`M 0 -16 Q ${sx * 18} -28 ${sx * 30} -19 Q ${sx * 15} -17 0 -16`} strokeWidth="1.1" />
          ))}
          <path d="M -26 22 L 26 22 L 19 31 L -19 31 Z" strokeWidth="1.4" />
          <path d="M -12 6 L 12 6" strokeWidth="0.9" />
        </g>
      </g>
      {/* sun and moon roundels in the spandrels */}
      <g fill="none" stroke={INK} strokeWidth="1.1" opacity="0.9">
        <g transform={`translate(${cx - r - 30} ${cy - r + 10})`}>
          <circle r="16" />
          <circle r="8" fill="currentColor" fillOpacity="0.25" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (Math.PI * 2 * i) / 12
            return <line key={i} x1={19 * Math.cos(a)} y1={19 * Math.sin(a)} x2={26 * Math.cos(a)} y2={26 * Math.sin(a)} />
          })}
        </g>
        <g transform={`translate(${cx + r + 30} ${cy - r + 10})`}>
          <circle r="16" />
          <path d="M 7 -13 A 15 15 0 1 0 7 13 A 11 11 0 1 1 7 -13 Z" fill="currentColor" fillOpacity="0.6" />
        </g>
      </g>
      {/* temple bells hanging inside the arch */}
      <g fill="none" stroke={INK} strokeWidth="1.3">
        {[cx - r + 46, cx + r - 46].map((x, i) => (
          <g key={x} className="sway-slow" style={{ transformOrigin: `${x}px ${cy - 80}px`, animationDelay: `${i * 0.8}s` }}>
            <line x1={x} y1={cy - 80} x2={x} y2={cy - 20} />
            <path d={`M ${x - 11} ${cy} Q ${x - 11} ${cy - 20} ${x} ${cy - 20} Q ${x + 11} ${cy - 20} ${x + 11} ${cy} Z`} fill="currentColor" fillOpacity="0.5" />
            <circle cx={x} cy={cy + 3} r="2.6" fill="currentColor" />
          </g>
        ))}
      </g>
      {/* lamps on the turrets and at the foot of the steps */}
      <Flame id={id} x={cx - r - 34} y={cy - 124} s={0.9} />
      <Flame id={id} x={cx + r + 34} y={cy - 124} s={0.9} delay={0.4} />
      <Flame id={id} x={cx - r - 60} y={floor + 2} s={1} delay={0.2} />
      <Flame id={id} x={cx + r + 60} y={floor + 2} s={1} delay={0.7} />
    </svg>
  )
}

/** Deepa stambha: a tiered lamp pillar with flickering flames. */
export function DeepaStambha({ className = '', tiers = 6 }: { className?: string; tiers?: number }) {
  const id = useSvgId('stambha')
  const top = 60
  const bottom = 560
  const step = (bottom - 120 - top) / tiers
  return (
    <svg viewBox="0 0 160 600" className={className} aria-hidden="true">
      <EngravingDefs id={id} />
      <g fill="none" stroke={INK} strokeLinecap="round">
        <path d={`M 74 ${top + 10} L 72 ${bottom - 40} M 86 ${top + 10} L 88 ${bottom - 40}`} strokeWidth="1.6" />
        <rect x={74} y={top + 20} width={12} height={bottom - top - 80} fill={`url(#${id}-hatch)`} stroke="none" />
        {/* base */}
        <path d={`M 40 ${bottom} L 120 ${bottom} L 110 ${bottom - 24} L 50 ${bottom - 24} Z`} strokeWidth="1.6" />
        <path d={`M 52 ${bottom - 24} L 108 ${bottom - 24} L 100 ${bottom - 44} L 60 ${bottom - 44} Z`} strokeWidth="1.4" />
        {Array.from({ length: tiers }).map((_, i) => {
          const y = top + 40 + i * step
          const w = 22 + i * 6
          return (
            <g key={i}>
              <path d={`M ${80 - w} ${y} Q 80 ${y + 16} ${80 + w} ${y}`} strokeWidth="1.4" />
              <path d={`M ${80 - w} ${y} L ${80 + w} ${y}`} strokeWidth="1" opacity="0.7" />
            </g>
          )
        })}
        {/* finial */}
        <path d={`M 70 ${top + 12} Q 80 ${top - 16} 90 ${top + 12} Z`} strokeWidth="1.4" />
      </g>
      {Array.from({ length: tiers }).map((_, i) => {
        const y = top + 34 + i * step
        const w = 22 + i * 6
        return (
          <g key={i}>
            <Flame id={id} x={80 - w} y={y} s={0.7} delay={i * 0.23} />
            <Flame id={id} x={80 + w} y={y} s={0.7} delay={i * 0.23 + 0.5} />
          </g>
        )
      })}
      <Flame id={id} x={80} y={top} s={1} delay={0.2} />
    </svg>
  )
}

/** Marigold toran garland with mango leaves, hung in swags across the top of a section. */
export function MarigoldToran({ className = '', swags = 6 }: { className?: string; swags?: number }) {
  const W = 1200
  const span = W / swags
  return (
    <svg viewBox={`0 0 ${W} 120`} preserveAspectRatio="none" className={className} aria-hidden="true">
      {Array.from({ length: swags }).map((_, s) => {
        const x0 = s * span
        const sag = 58
        const flowers = 11
        return (
          <g key={s} className="sway" style={{ animationDelay: `${s * 0.35}s`, transformOrigin: `${x0 + span / 2}px 0px` }}>
            {Array.from({ length: flowers }).map((__, i) => {
              const t = (i + 0.5) / flowers
              const x = x0 + t * span
              const y = 8 + 4 * sag * t * (1 - t)
              return <circle key={i} cx={x} cy={y} r={8.5} fill={i % 3 === 1 ? '#ffc56b' : '#f28a1a'} stroke="#c96a06" strokeWidth="1.2" />
            })}
            {/* hanging mango leaf + marigold drop at the centre of each swag */}
            <g transform={`translate(${x0 + span / 2} ${8 + sag})`}>
              <line x1="0" y1="0" x2="0" y2="26" stroke="#c96a06" strokeWidth="1.4" />
              <circle cx="0" cy="32" r="7" fill="#ffa62b" stroke="#c96a06" strokeWidth="1.2" />
              <path d="M0 38 Q 9 50 0 64 Q -9 50 0 38Z" fill="#3e7a3a" stroke="#244f22" strokeWidth="1" />
              <line x1="0" y1="40" x2="0" y2="62" stroke="#9ccf8f" strokeWidth="0.8" />
            </g>
            {/* knot at each hanging point */}
            <circle cx={x0} cy={8} r={5} fill="#a31d1d" />
          </g>
        )
      })}
      <circle cx={W} cy={8} r={5} fill="#a31d1d" />
    </svg>
  )
}

/** Engraved lotus pond: a band of leaves, buds and open lotuses. */
export function LotusPond({ className = '' }: { className?: string }) {
  const id = useSvgId('pond')
  const items = Array.from({ length: 14 })
  return (
    <svg viewBox="0 0 1200 140" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <EngravingDefs id={id} />
      <g fill="none" stroke={INK} strokeLinecap="round">
        <path d="M0 132 Q 300 120 600 132 T 1200 132" strokeWidth="1" opacity="0.6" />
        {[0, 1, 2].map((r) => (
          <path key={r} d={`M0 ${138 - r * 4} Q 300 ${126 - r * 4} 600 ${138 - r * 4} T 1200 ${138 - r * 4}`} strokeWidth="0.6" opacity="0.4" />
        ))}
        {items.map((_, i) => {
          const x = 40 + i * 86 + (i % 2) * 18
          if (i % 3 === 0) {
            // open lotus
            return (
              <g key={i} transform={`translate(${x} 104)`}>
                <path d="M0 0 Q -6 -26 0 -40 Q 6 -26 0 0Z" strokeWidth="1.3" fill="#ffd9d0" fillOpacity="0.35" />
                {[-1, 1].map((sx) => (
                  <g key={sx}>
                    <path d={`M0 0 Q ${sx * 22} -14 ${sx * 20} -34 Q ${sx * 6} -20 0 0Z`} strokeWidth="1.2" fill="#ffd9d0" fillOpacity="0.25" />
                    <path d={`M0 0 Q ${sx * 34} -2 ${sx * 36} -18 Q ${sx * 14} -10 0 0Z`} strokeWidth="1.1" />
                  </g>
                ))}
                <path d="M -2 0 Q 0 12 -2 26" strokeWidth="1" />
              </g>
            )
          }
          if (i % 3 === 1) {
            // lily pad with veins
            return (
              <g key={i} transform={`translate(${x} 122)`}>
                <ellipse rx="34" ry="9" strokeWidth="1.2" fill={`url(#${id}-hatch)`} />
                {[-24, -12, 0, 12, 24].map((vx) => (
                  <line key={vx} x1="0" y1="0" x2={vx} y2={vx === 0 ? -8 : -6} strokeWidth="0.7" opacity="0.7" />
                ))}
              </g>
            )
          }
          // bud on a stalk
          return (
            <g key={i} transform={`translate(${x} 120)`}>
              <path d="M0 0 Q 4 -30 0 -56" strokeWidth="1.1" />
              <path d="M0 -56 Q -8 -66 0 -80 Q 8 -66 0 -56Z" strokeWidth="1.2" fill="#ffd9d0" fillOpacity="0.3" />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

/** Fine engraved backdrop: interlocking paisley (bootis) and stars, used at low opacity. */
export function EngravedBackdrop({ className = '' }: { className?: string }) {
  const id = useSvgId('booti')
  return (
    <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true">
      <defs>
        <pattern id={id} width="72" height="72" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="0.8">
            <path d="M18 30 C 8 22 12 8 24 8 C 34 8 36 20 30 26 C 26 30 22 26 24 22" />
            <path d="M54 66 C 44 58 48 44 60 44 C 70 44 72 56 66 62 C 62 66 58 62 60 58" />
            <path d="M54 18 l 3 -6 l 3 6 l 6 3 l -6 3 l -3 6 l -3 -6 l -6 -3 Z" />
            <circle cx="18" cy="56" r="2" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

/** Sun and moon roundels (Surya and Chandra), engraved, as in temple gateway carvings. */
export function SunMoon({ kind, className = '' }: { kind: 'sun' | 'moon'; className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="40" cy="40" r="22" />
        {kind === 'sun' ? (
          Array.from({ length: 16 }).map((_, i) => {
            const a = (Math.PI * 2 * i) / 16
            return <line key={i} x1={40 + 26 * Math.cos(a)} y1={40 + 26 * Math.sin(a)} x2={40 + 36 * Math.cos(a)} y2={40 + 36 * Math.sin(a)} />
          })
        ) : (
          <path d="M 50 22 A 20 20 0 1 0 50 58 A 16 16 0 1 1 50 22 Z" fill="currentColor" fillOpacity="0.85" />
        )}
        {kind === 'sun' && <circle cx="40" cy="40" r="12" fill="currentColor" fillOpacity="0.25" />}
      </g>
    </svg>
  )
}

const RANGOLI = ['#ffa62b', '#d6246e', '#128189', '#d7261e', '#e3a21a', '#6b2fa3']

/** A border of rangoli flowers and kolam dots in festival colours. */
export function RangoliBand({ className = '', count = 12 }: { className?: string; count?: number }) {
  const step = 1200 / count
  return (
    <svg viewBox="0 0 1200 64" preserveAspectRatio="xMidYMid slice" className={`block w-full ${className}`} aria-hidden="true">
      <line x1="0" y1="32" x2="1200" y2="32" stroke="#e3a21a" strokeWidth="1.2" strokeDasharray="2 6" />
      {Array.from({ length: count }).map((_, i) => {
        const cx = step / 2 + i * step
        const c1 = RANGOLI[i % RANGOLI.length]
        const c2 = RANGOLI[(i + 2) % RANGOLI.length]
        const c3 = RANGOLI[(i + 4) % RANGOLI.length]
        return (
          <g key={i} transform={`translate(${cx} 32)`}>
            {Array.from({ length: 8 }).map((__, k) => (
              <ellipse key={k} cx="0" cy="-15" rx="6" ry="13" fill={k % 2 ? c1 : c2} transform={`rotate(${k * 45})`} opacity="0.95" />
            ))}
            {Array.from({ length: 8 }).map((__, k) => (
              <ellipse key={`i${k}`} cx="0" cy="-8" rx="3.2" ry="6.5" fill="#fff4dc" transform={`rotate(${k * 45 + 22.5})`} />
            ))}
            <circle r="5.5" fill={c3} />
            <circle r="2" fill="#fff4dc" />
            {[-1, 1].map((sx) => (
              <g key={sx}>
                <circle cx={sx * step * 0.5} cy="0" r="3" fill={c1} />
                <circle cx={sx * step * 0.32} cy="-12" r="1.8" fill="#e3a21a" />
                <circle cx={sx * step * 0.32} cy="12" r="1.8" fill="#e3a21a" />
              </g>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

/** A slowly turning mandala of petals, used as a halo (prabhamandala) behind the deities. */
export function MandalaHalo({ className = '' }: { className?: string }) {
  const id = useSvgId('halo')
  return (
    <svg viewBox="-200 -200 400 400" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.75" />
          <stop offset="0.55" stopColor="#ff8a1a" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ff8a1a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="200" fill={`url(#${id})`} />
      <g className="mandala-spin" fill="none" stroke="#ffd27a" strokeWidth="1.2" opacity="0.75">
        {Array.from({ length: 24 }).map((_, k) => (
          <path key={k} d="M 0 -120 Q 14 -150 0 -184 Q -14 -150 0 -120 Z" transform={`rotate(${k * 15})`} />
        ))}
        {Array.from({ length: 16 }).map((_, k) => (
          <path key={`m${k}`} d="M 0 -78 Q 18 -98 0 -116 Q -18 -98 0 -78 Z" transform={`rotate(${k * 22.5 + 11.25})`} fill="#ffa62b" fillOpacity="0.18" />
        ))}
        <circle r="120" strokeDasharray="2 5" />
        <circle r="186" />
        <circle r="76" />
      </g>
    </svg>
  )
}

/** Twinkling stars for evening skies. Deterministic positions so server and client match. */
export function Stars({ count = 28, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="twinkle absolute rounded-full bg-ivory-50"
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 60}%`, width: i % 4 ? 2 : 3, height: i % 4 ? 2 : 3, animationDelay: `${(i % 7) * 0.6}s` }}
        />
      ))}
    </div>
  )
}

/**
 * Distant silhouettes of nagara Mandirs on the horizon, for the dusk sky: each has a curved
 * shikhara with smaller spires, an amalaka, kalash and flag, and a stepped mandapa roof (the same
 * forms as the new Mandir drawing). Palms between them. No domes.
 */
export function TempleSkyline({ className = '' }: { className?: string }) {
  const G = 120
  const spire = (cx: number, h: number, w: number) => {
    const top = G - h
    const tw = Math.max(4, w * 0.28)
    return `M ${cx - w} ${G} C ${cx - w} ${G - h * 0.45} ${cx - tw - w * 0.2} ${top + h * 0.2} ${cx - tw} ${top} L ${cx + tw} ${top} C ${cx + tw + w * 0.2} ${top + h * 0.2} ${cx + w} ${G - h * 0.45} ${cx + w} ${G} Z`
  }
  const temple = (cx: number, k: number) => {
    const h = 92 * k
    const w = 30 * k
    const top = G - h
    const tw = Math.max(4, w * 0.28)
    return (
      <g key={cx}>
        {/* side spires (urushringas) */}
        <path d={spire(cx - w * 0.9, h * 0.55, w * 0.5)} />
        <path d={spire(cx + w * 0.9, h * 0.55, w * 0.5)} />
        {/* main shikhara, amalaka, kalash and flag */}
        <path d={spire(cx, h, w)} />
        <ellipse cx={cx} cy={top - 2 * k} rx={tw * 1.7} ry={3 * k} />
        <path d={`M ${cx - 3 * k} ${top - 4 * k} Q ${cx} ${top - 14 * k} ${cx + 3 * k} ${top - 4 * k} Z`} />
        <rect x={cx - 0.8} y={top - 30 * k} width="1.6" height={18 * k} />
        <path d={`M ${cx + 0.8} ${top - 30 * k} L ${cx + 14 * k} ${top - 26 * k} L ${cx + 0.8} ${top - 22 * k} Z`} />
        {/* mandapa with a stepped (phamsana) roof in front */}
        {[0, 1, 2, 3].map((t) => (
          <rect key={t} x={cx - w * 2.6 + t * 6 * k} y={G - 28 * k - t * 7 * k} width={w * 2.2 - t * 12 * k} height={7 * k} />
        ))}
        <rect x={cx - w * 2.6} y={G - 28 * k} width={w * 2.2} height={28 * k} />
      </g>
    )
  }
  const palm = (x: number, h: number) =>
    `M ${x - 1.5} ${G} L ${x - 1} ${G - h} L ${x + 1} ${G - h} L ${x + 1.5} ${G} Z M ${x} ${G - h} q -14 -2 -22 8 q 10 -10 22 -8 q -12 -10 -24 -4 q 14 -6 24 4 q 4 -12 18 -14 q -12 4 -18 14 q 14 -4 22 6 q -12 -8 -22 -6 Z`
  return (
    <svg viewBox="0 0 1200 120" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden="true">
      <g fill="currentColor">
        <rect x="0" y="108" width="1200" height="12" />
        <path d={palm(40, 58)} />
        {temple(170, 0.62)}
        <path d={palm(270, 50)} />
        <path d={palm(310, 64)} />
        {temple(470, 0.8)}
        <path d={palm(560, 56)} />
        {temple(700, 1)}
        <path d={palm(800, 60)} />
        <path d={palm(840, 46)} />
        {temple(990, 0.7)}
        <path d={palm(1090, 62)} />
        {temple(1170, 0.5)}
      </g>
    </svg>
  )
}

/** A gentle strand of marigold and jasmine flowers: a quieter border than the rangoli. */
export function FlowerStrand({ className = '', count = 22 }: { className?: string; count?: number }) {
  const step = 1200 / count
  return (
    <svg viewBox="0 0 1200 40" preserveAspectRatio="xMidYMid slice" className={`block w-full ${className}`} aria-hidden="true">
      <path d="M0 20 Q 300 26 600 20 T 1200 20" fill="none" stroke="#e3a21a" strokeOpacity="0.45" strokeWidth="1" />
      {Array.from({ length: count }).map((_, i) => {
        const cx = step / 2 + i * step
        const cy = 20 + Math.sin(i * 0.9) * 2
        if (i % 2) {
          // jasmine bud cluster
          return (
            <g key={i} transform={`translate(${cx} ${cy})`} opacity="0.85">
              {[0, 120, 240].map((r) => (
                <ellipse key={r} cy="-4" rx="2" ry="4" fill="#fff4dc" transform={`rotate(${r})`} />
              ))}
            </g>
          )
        }
        return (
          <g key={i} transform={`translate(${cx} ${cy})`} opacity="0.9">
            {Array.from({ length: 10 }).map((__, k) => (
              <ellipse key={k} cy="-5.5" rx="2.6" ry="5" fill={k % 2 ? '#ffa62b' : '#f28a1a'} transform={`rotate(${k * 36})`} />
            ))}
            <circle r="2.6" fill="#c96a06" />
          </g>
        )
      })}
    </svg>
  )
}
