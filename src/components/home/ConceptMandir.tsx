/**
 * Concept illustrations of the new Mandir complex (spec section 13, FR-04): a front elevation at
 * dusk and an indicative site plan. They show the spaces the community has asked for: the sanctum
 * beneath the shikhara, a prayer hall, a multi-purpose hall for 500+ with badminton courts, a
 * kitchen and dining hall, a library, an office and a large car park. No architect's drawings
 * exist yet, so both are always labelled "Artist's impression, not final design", and editors can
 * replace them with uploaded concept visuals in the CMS (New Mandir appeal → Vision).
 */

const STONE = '#f3dfbd'
const STONE_SHADE = '#d8b88a'
const STONE_DEEP = '#b9946a'
const LIT = '#ffcf73'

/** A nagara spire: curved tower with tiers, an amalaka and (optionally) a kalash and flag. */
function Spire({ cx, base, top, half, crown = true, flag = false }: { cx: number; base: number; top: number; half: number; crown?: boolean; flag?: boolean }) {
  const topHalf = Math.max(10, half * 0.3)
  const h = base - top
  const body = `M ${cx - half} ${base} C ${cx - half + 4} ${base - h * 0.45} ${cx - topHalf - half * 0.25} ${top + h * 0.25} ${cx - topHalf} ${top} L ${cx + topHalf} ${top} C ${cx + topHalf + half * 0.25} ${top + h * 0.25} ${cx + half - 4} ${base - h * 0.45} ${cx + half} ${base} Z`
  const tiers = Math.max(4, Math.round(h / 26))
  const widthAt = (t: number) => half - (half - topHalf) * Math.pow(t, 1.25)
  return (
    <g>
      <path d={body} fill="url(#c-stone)" stroke={STONE_DEEP} strokeWidth="1.5" />
      {/* shaded right face */}
      <path d={`M ${cx} ${top} L ${cx + topHalf} ${top} C ${cx + topHalf + half * 0.25} ${top + h * 0.25} ${cx + half - 4} ${base - h * 0.45} ${cx + half} ${base} L ${cx} ${base} Z`} fill={STONE_SHADE} opacity="0.55" />
      {Array.from({ length: tiers }).map((_, i) => {
        const t = (i + 0.5) / tiers
        const y = base - t * h
        const w = widthAt(t)
        return <path key={i} d={`M ${cx - w} ${y} Q ${cx} ${y + 5} ${cx + w} ${y}`} fill="none" stroke={STONE_DEEP} strokeWidth="1.1" opacity="0.8" />
      })}
      <path d={`M ${cx} ${base} L ${cx} ${top}`} stroke={STONE_DEEP} strokeWidth="1" opacity="0.5" />
      {crown && (
        <g>
          <ellipse cx={cx} cy={top - 6} rx={topHalf * 1.7} ry={Math.max(4, topHalf * 0.45)} fill={STONE} stroke={STONE_DEEP} strokeWidth="1.3" />
          <path d={`M ${cx - topHalf * 0.6} ${top - 10} Q ${cx - topHalf * 0.9} ${top - 26} ${cx} ${top - 30} Q ${cx + topHalf * 0.9} ${top - 26} ${cx + topHalf * 0.6} ${top - 10} Z`} fill="#e3a21a" stroke="#8c6a2c" strokeWidth="1" />
          <line x1={cx} y1={top - 30} x2={cx} y2={top - (flag ? 80 : 38)} stroke="#8c6a2c" strokeWidth="2" />
          {flag && <path className="flag-wave" d={`M ${cx} ${top - 80} L ${cx + 46} ${top - 70} L ${cx} ${top - 58} Z`} fill="#f28a1a" stroke="#c96a06" strokeWidth="1" />}
        </g>
      )}
    </g>
  )
}

/** A ribbed dome (as over a mandapa or chhatri) with a kalash. */
function Dome({ cx, base, r }: { cx: number; base: number; r: number }) {
  return (
    <g>
      <path d={`M ${cx - r} ${base} C ${cx - r} ${base - r * 1.2} ${cx + r} ${base - r * 1.2} ${cx + r} ${base} Z`} fill="url(#c-stone)" stroke={STONE_DEEP} strokeWidth="1.4" />
      {[-0.5, 0, 0.5].map((k) => (
        <path key={k} d={`M ${cx + k * r} ${base} Q ${cx + k * r * 0.6} ${base - r * 0.7} ${cx} ${base - r * 0.9}`} fill="none" stroke={STONE_DEEP} strokeWidth="0.9" opacity="0.7" />
      ))}
      <rect x={cx - r - 6} y={base} width={2 * r + 12} height={8} fill={STONE_SHADE} />
      <path d={`M ${cx - 6} ${base - r * 0.9} Q ${cx - 9} ${base - r * 0.9 - 14} ${cx} ${base - r * 0.9 - 18} Q ${cx + 9} ${base - r * 0.9 - 14} ${cx + 6} ${base - r * 0.9} Z`} fill="#e3a21a" />
      <line x1={cx} y1={base - r * 0.9 - 18} x2={cx} y2={base - r * 0.9 - 28} stroke="#8c6a2c" strokeWidth="1.5" />
    </g>
  )
}

/** A chhatri: a small domed pavilion on four pillars, used to crown corners. */
function Chhatri({ cx, base, w = 44 }: { cx: number; base: number; w?: number }) {
  return (
    <g>
      <rect x={cx - w / 2} y={base - 6} width={w} height={6} fill={STONE_SHADE} />
      {[-0.4, -0.13, 0.13, 0.4].map((k) => (
        <rect key={k} x={cx + k * w - 2} y={base - 34} width={4} height={28} fill={STONE} stroke={STONE_DEEP} strokeWidth="0.6" />
      ))}
      <rect x={cx - w / 2 - 3} y={base - 40} width={w + 6} height={6} fill={STONE_SHADE} />
      <Dome cx={cx} base={base - 40} r={w / 2 - 2} />
    </g>
  )
}

/** A row of cusped (multifoil) arches, lit from within. */
function Arcade({ x0, x1, top, bottom, bays, lit = true }: { x0: number; x1: number; top: number; bottom: number; bays: number; lit?: boolean }) {
  const w = (x1 - x0) / bays
  return (
    <g>
      {Array.from({ length: bays }).map((_, i) => {
        const a = x0 + i * w + w * 0.14
        const b = x0 + (i + 1) * w - w * 0.14
        const m = (a + b) / 2
        const d = `M ${a} ${bottom} L ${a} ${top + 22} Q ${a} ${top + 8} ${a + (b - a) * 0.25} ${top + 6} Q ${m - 6} ${top + 4} ${m} ${top} Q ${m + 6} ${top + 4} ${b - (b - a) * 0.25} ${top + 6} Q ${b} ${top + 8} ${b} ${top + 22} L ${b} ${bottom} Z`
        return <path key={i} d={d} fill={lit ? 'url(#c-lit)' : '#5b3a2b'} stroke={STONE_DEEP} strokeWidth="1.2" />
      })}
    </g>
  )
}

function Label({ x, y, text, anchor = 'middle', to }: { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; to?: [number, number] }) {
  const w = text.length * 10.4 + 26
  const bx = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x
  return (
    <g>
      {to && <path d={`M ${x} ${y + 17} L ${to[0]} ${to[1]}`} stroke="#fbf7ef" strokeWidth="1.4" strokeDasharray="3 4" />}
      {to && <circle cx={to[0]} cy={to[1]} r="4" fill="#fbf7ef" />}
      <rect x={bx} y={y - 17} width={w} height={34} rx={17} fill="#fbf7ef" opacity="0.94" />
      <text x={bx + w / 2} y={y + 6} textAnchor="middle" fontSize="18" fontWeight="600" fill="#7f1616" style={{ fontFamily: 'var(--font-sans)' }}>
        {text}
      </text>
    </g>
  )
}

/** Front elevation of the new Mandir complex at dusk. */
export function ConceptMandir({ className = '', title = "Artist's impression of the new Mandir complex at dusk", labels = true }: { className?: string; title?: string; labels?: boolean }) {
  return (
    <svg viewBox="0 0 1600 900" role="img" aria-label={title} className={className} preserveAspectRatio="xMidYMid slice">
      <title>{title}</title>
      <defs>
        <linearGradient id="c-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#151b3a" />
          <stop offset="0.38" stopColor="#3b2246" />
          <stop offset="0.66" stopColor="#a31d1d" />
          <stop offset="0.86" stopColor="#f28a1a" />
          <stop offset="1" stopColor="#ffc56b" />
        </linearGradient>
        <linearGradient id="c-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4e0" />
          <stop offset="1" stopColor={STONE} />
        </linearGradient>
        <linearGradient id="c-lit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe3a3" />
          <stop offset="1" stopColor="#f28a1a" />
        </linearGradient>
        <radialGradient id="c-glow" cx="0.5" cy="0.6" r="0.5">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="c-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a1f2c" />
          <stop offset="1" stopColor="#151b3a" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#c-sky)" />
      <g fill="#fbf6ee">
        {[[90, 70], [210, 150], [330, 55], [470, 120], [1130, 60], [1240, 140], [1380, 80], [1500, 160], [560, 40], [150, 250], [1450, 260], [400, 220], [1030, 30]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2 : 1.2} opacity={0.5 + (i % 3) * 0.2} />
        ))}
      </g>
      <path d="M 1360 110 A 36 36 0 1 0 1396 160 A 28 28 0 1 1 1360 110 Z" fill="#fff1c9" opacity="0.9" />
      <ellipse cx="800" cy="560" rx="760" ry="440" fill="url(#c-glow)" />

      {/* distant trees */}
      <path d="M0 690 C70 650 130 680 200 655 S320 668 380 676 L380 760 L0 760Z" fill="#2a1d3a" opacity="0.85" />
      <path d="M1220 676 C1290 650 1360 668 1430 648 S1560 662 1600 652 L1600 760 L1220 760Z" fill="#2a1d3a" opacity="0.85" />

      {/* ground and forecourt */}
      <rect y="760" width="1600" height="140" fill="url(#c-ground)" />
      <path d="M 520 760 L 1080 760 L 1180 900 L 420 900 Z" fill="#6b4a3a" opacity="0.55" />
      {Array.from({ length: 6 }).map((_, i) => (
        <path key={i} d={`M ${520 - i * 18} ${776 + i * 22} L ${1080 + i * 18} ${776 + i * 22}`} stroke="#c9a77f" strokeOpacity="0.25" strokeWidth="1" />
      ))}

      {/* left wing: multi-purpose hall for 500+ */}
      <g>
        <rect x="110" y="560" width="420" height="200" fill="url(#c-stone)" stroke={STONE_DEEP} strokeWidth="1.5" />
        <rect x="110" y="560" width="420" height="200" fill={STONE_SHADE} opacity="0.25" />
        <rect x="100" y="546" width="440" height="16" fill={STONE_SHADE} stroke={STONE_DEEP} strokeWidth="1" />
        {Array.from({ length: 22 }).map((_, i) => (
          <circle key={i} cx={112 + i * 19.5} cy={554} r="4" fill="none" stroke={STONE_DEEP} strokeWidth="0.9" />
        ))}
        <Arcade x0={130} x1={510} top={600} bottom={730} bays={8} />
        <rect x="110" y="730" width="420" height="30" fill={STONE_SHADE} />
        <Chhatri cx={130} base={546} />
        <Chhatri cx={510} base={546} />
        <Dome cx={320} base={546} r={46} />
      </g>

      {/* right wing: library, office, kitchen and dining (two storeys) */}
      <g>
        <rect x="1070" y="540" width="420" height="220" fill="url(#c-stone)" stroke={STONE_DEEP} strokeWidth="1.5" />
        <rect x="1060" y="526" width="440" height="16" fill={STONE_SHADE} stroke={STONE_DEEP} strokeWidth="1" />
        <rect x="1070" y="640" width="420" height="10" fill={STONE_SHADE} />
        {Array.from({ length: 7 }).map((_, i) => (
          <g key={i}>
            <path d={`M ${1094 + i * 56} 628 L ${1094 + i * 56} 580 Q ${1110 + i * 56} 562 ${1126 + i * 56} 580 L ${1126 + i * 56} 628 Z`} fill={i % 3 === 1 ? '#5b3a2b' : LIT} stroke={STONE_DEEP} strokeWidth="1" />
            <path d={`M ${1094 + i * 56} 740 L ${1094 + i * 56} 680 Q ${1110 + i * 56} 662 ${1126 + i * 56} 680 L ${1126 + i * 56} 740 Z`} fill={LIT} stroke={STONE_DEEP} strokeWidth="1" />
          </g>
        ))}
        <Chhatri cx={1090} base={526} />
        <Chhatri cx={1470} base={526} />
        <Chhatri cx={1280} base={526} w={56} />
      </g>

      {/* main shikhara over the sanctum, with clustered spires (urushringas) */}
      <Spire cx={800} base={560} top={140} half={150} flag />
      <Spire cx={690} base={560} top={330} half={74} />
      <Spire cx={910} base={560} top={330} half={74} />
      <Spire cx={630} base={560} top={430} half={48} />
      <Spire cx={970} base={560} top={430} half={48} />

      {/* prayer hall (mandapa) with domes */}
      <g>
        <rect x="580" y="560" width="440" height="140" fill="url(#c-stone)" stroke={STONE_DEEP} strokeWidth="1.5" />
        <rect x="570" y="548" width="460" height="14" fill={STONE_SHADE} stroke={STONE_DEEP} strokeWidth="1" />
        <Arcade x0={596} x1={1004} top={588} bottom={700} bays={7} />
        <Dome cx={660} base={548} r={34} />
        <Dome cx={940} base={548} r={34} />
      </g>
      {/* entrance porch with its own small shikhara */}
      <g>
        <rect x="740" y="590" width="120" height="110" fill="url(#c-stone)" stroke={STONE_DEEP} strokeWidth="1.5" />
        <path d="M 764 700 L 764 640 Q 764 618 780 614 Q 796 604 800 596 Q 804 604 820 614 Q 836 618 836 640 L 836 700 Z" fill="url(#c-lit)" stroke={STONE_DEEP} strokeWidth="1.4" />
        <rect x="732" y="578" width="136" height="14" fill={STONE_SHADE} stroke={STONE_DEEP} strokeWidth="1" />
        <Spire cx={800} base={578} top={500} half={54} />
      </g>

      {/* jagati plinth and steps */}
      <rect x="540" y="700" width="520" height="22" fill={STONE_SHADE} stroke={STONE_DEEP} strokeWidth="1" />
      <rect x="530" y="722" width="540" height="38" fill={STONE_DEEP} opacity="0.85" />
      {Array.from({ length: 4 }).map((_, i) => (
        <rect key={i} x={740 - i * 14} y={700 + i * 15} width={120 + i * 28} height="15" fill={i % 2 ? '#e3caa3' : '#d9bd94'} />
      ))}

      {/* deepa stambhas, trees and people for scale */}
      {[560, 1040].map((x) => (
        <g key={x}>
          <rect x={x - 4} y={640} width="8" height="120" fill={STONE_SHADE} />
          {[650, 672, 694, 716].map((y, k) => (
            <g key={y}>
              <rect x={x - 12 - k * 2} y={y} width={24 + k * 4} height="3" fill={STONE_DEEP} />
              <circle cx={x - 12 - k * 2} cy={y - 3} r="3" fill={LIT} />
              <circle cx={x + 12 + k * 2} cy={y - 3} r="3" fill={LIT} />
            </g>
          ))}
          <circle cx={x} cy={634} r="5" fill={LIT} />
        </g>
      ))}
      {[[60, 740], [470, 770], [1130, 770], [1545, 745]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 3} y={y} width="6" height="34" fill="#2a1d1a" />
          <circle cx={x} cy={y - 18} r="30" fill="#1f3a2c" />
          <circle cx={x - 14} cy={y - 6} r="20" fill="#244634" />
          <circle cx={x + 16} cy={y - 8} r="18" fill="#1b3226" />
        </g>
      ))}
      {[[700, 800], [736, 812], [880, 806], [920, 820], [640, 832]].map(([x, y], i) => (
        <g key={i} fill="#1a1426">
          <circle cx={x} cy={y - 22} r="5" />
          <path d={`M ${x - 6} ${y} L ${x - 5} ${y - 16} Q ${x} ${y - 19} ${x + 5} ${y - 16} L ${x + 6} ${y} Z`} fill={i % 2 ? '#a31d1d' : '#e3a21a'} />
        </g>
      ))}

      {/* car park to the side */}
      <g>
        <path d="M 1200 820 L 1600 820 L 1600 900 L 1160 900 Z" fill="#2b2433" />
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={1210 + i * 46} y1={826} x2={1196 + i * 46} y2={896} stroke="#fbf7ef" strokeOpacity="0.35" strokeWidth="2" />
        ))}
        {[1226, 1318, 1410, 1502].map((x, i) => (
          <g key={x} transform={`translate(${x} 858)`}>
            <path d="M -26 12 L -26 0 Q -22 -10 -12 -12 L 12 -12 Q 22 -10 26 0 L 26 12 Z" fill={['#7f1616', '#3b4378', '#c96a06', '#4b6d5a'][i]} />
            <rect x="-18" y="-9" width="36" height="7" rx="2" fill="#ffe3a3" opacity="0.5" />
            <circle cx="-15" cy="13" r="5" fill="#111" />
            <circle cx="15" cy="13" r="5" fill="#111" />
          </g>
        ))}
      </g>

      {labels && (
        <g>
          <Label x={470} y={170} text="Sanctum beneath the shikhara" to={[720, 250]} />
          <Label x={360} y={470} text="Multi-purpose hall · 500+" to={[320, 600]} />
          <Label x={800} y={862} text="Prayer hall" to={[800, 680]} />
          <Label x={1280} y={440} text="Library · office · kitchen & dining" to={[1280, 560]} />
          <Label x={1400} y={790} text="Car park" />
        </g>
      )}
    </svg>
  )
}

type Zone = { n: number; name: string; detail?: string; x: number; y: number; w: number; h: number; fill: string }

/** Indicative site plan of the new Mandir complex. Not to scale. */
export function ConceptPlan({ className = '' }: { className?: string }) {
  const zones: Zone[] = [
    { n: 1, name: 'Sanctum', detail: 'garbhagriha', x: 615, y: 70, w: 130, h: 110, fill: '#f6dcd8' },
    { n: 2, name: 'Prayer hall', detail: 'mandapa', x: 570, y: 220, w: 220, h: 210, fill: '#fbf1ef' },
    { n: 3, name: 'Multi-purpose hall', detail: '500+ seated · 4 badminton courts · stage', x: 40, y: 40, w: 340, h: 330, fill: '#fff6e6' },
    { n: 4, name: 'Kitchen', x: 395, y: 40, w: 150, h: 130, fill: '#eef3ef' },
    { n: 5, name: 'Dining hall', x: 395, y: 180, w: 150, h: 190, fill: '#eef3ef' },
    { n: 6, name: 'Library', x: 815, y: 40, w: 145, h: 170, fill: '#e7eaf5' },
    { n: 7, name: 'Office & reception', x: 815, y: 220, w: 145, h: 150, fill: '#e7eaf5' },
    { n: 8, name: 'Car park', detail: 'with accessible bays', x: 40, y: 400, w: 340, h: 235, fill: '#efe9e0' },
  ]
  return (
    <svg viewBox="0 0 1000 720" role="img" aria-labelledby="plan-title plan-desc" className={className}>
      <title id="plan-title">Indicative site plan of the new Mandir complex</title>
      <desc id="plan-desc">
        The sanctum sits at the head of the prayer hall, with a walkway around it. To one side are a multi-purpose hall for more than 500 people with four badminton courts and a stage, and a kitchen serving both the hall and a dining hall. On the other side are a library and an office with reception. In front is a forecourt garden, and a large car park sits beside the entrance from the road.
      </desc>
      <defs>
        <pattern id="plan-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#b8893b" strokeOpacity="0.12" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="1000" height="720" fill="#fbf7ef" />
      <rect width="1000" height="720" fill="url(#plan-grid)" />
      {/* site boundary and road */}
      <rect x="20" y="20" width="960" height="630" fill="none" stroke="#5c5049" strokeWidth="2" strokeDasharray="10 6" />
      <rect x="0" y="664" width="1000" height="56" fill="#d9d2c7" />
      <text x="500" y="698" textAnchor="middle" fontSize="18" fill="#3a312c" style={{ fontFamily: 'var(--font-sans)' }}>
        Road · site entrance
      </text>
      {/* entrances */}
      <rect x="170" y="646" width="90" height="22" fill="#fbf7ef" />
      <rect x="640" y="646" width="80" height="22" fill="#fbf7ef" />

      {/* forecourt garden */}
      <rect x="395" y="450" width="565" height="185" fill="#e3efe4" stroke="#4b6d5a" strokeWidth="1.2" />
      <rect x="660" y="450" width="40" height="200" fill="#efe1c8" />
      {[[460, 520], [540, 590], [880, 520], [800, 590], [930, 600]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="22" fill="#8fb09c" opacity="0.8" />
          <circle cx={x} cy={y} r="22" fill="none" stroke="#2f4a3a" strokeWidth="1" />
        </g>
      ))}
      {[620, 740].map((x) => (
        <g key={x}>
          <circle cx={x} cy={500} r="9" fill="#e3a21a" />
          <circle cx={x} cy={500} r="4" fill="#a31d1d" />
        </g>
      ))}
      <text x="560" y="625" textAnchor="middle" fontSize="16" fill="#1c2e24" style={{ fontFamily: 'var(--font-sans)' }}>
        Forecourt garden
      </text>

      {/* pradakshina path around the sanctum */}
      <rect x="595" y="50" width="170" height="150" rx="8" fill="none" stroke="#a31d1d" strokeWidth="2" strokeDasharray="6 6" />
      <path d="M 770 120 L 778 130 L 770 140" fill="none" stroke="#a31d1d" strokeWidth="2" />

      {zones.map((z) => (
        <g key={z.n}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={z.fill} stroke="#3a312c" strokeWidth="2" />
          <circle cx={z.x + 22} cy={z.y + 24} r="13" fill="#a31d1d" />
          <text x={z.x + 22} y={z.y + 29} textAnchor="middle" fontSize="15" fontWeight="700" fill="#fbf7ef" style={{ fontFamily: 'var(--font-sans)' }}>
            {z.n}
          </text>
          <text x={z.x + 42} y={z.y + 30} fontSize="18" fontWeight="600" fill="#2b2421" style={{ fontFamily: 'var(--font-sans)' }}>
            {z.name}
          </text>
          {z.detail && (
            <text x={z.x + 12} y={z.y + 56} fontSize="14" fill="#4a403a" style={{ fontFamily: 'var(--font-sans)' }}>
              {z.detail}
            </text>
          )}
        </g>
      ))}

      {/* murti platform in the sanctum */}
      <rect x="650" y="120" width="60" height="30" fill="#e3a21a" stroke="#8c6a2c" />
      {/* pillars in the prayer hall */}
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 4 }).map((__, c) => <circle key={`${r}-${c}`} cx={610 + c * 47} cy={290 + r * 40} r="5" fill="#b8893b" />),
      )}
      {/* entrance porch and shoe room */}
      <rect x="640" y="430" width="80" height="22" fill="#fbf1ef" stroke="#3a312c" strokeWidth="1.5" />
      {/* badminton courts and stage in the multi-purpose hall */}
      {[0, 1].map((r) =>
        [0, 1].map((c) => (
          <g key={`${r}${c}`} transform={`translate(${70 + c * 155} ${106 + r * 118})`}>
            <rect width="130" height="108" fill="#d6e3da" stroke="#2f4a3a" strokeWidth="1.2" />
            <line x1="65" y1="0" x2="65" y2="108" stroke="#2f4a3a" strokeWidth="1.5" />
            <rect x="10" y="8" width="110" height="92" fill="none" stroke="#2f4a3a" strokeWidth="0.8" />
          </g>
        )),
      )}
      <rect x="70" y="342" width="285" height="20" fill="#e3a21a" opacity="0.6" />
      <text x="212" y="356" textAnchor="middle" fontSize="13" fill="#2b2421" style={{ fontFamily: 'var(--font-sans)' }}>
        stage
      </text>
      {/* car park bays */}
      {[0, 1, 2].map((row) =>
        Array.from({ length: 12 }).map((_, i) => (
          <rect key={`${row}-${i}`} x={52 + i * 26.5} y={row === 0 ? 470 : row === 1 ? 540 : 590} width="22" height={row === 2 ? 36 : 44} fill="none" stroke="#8a7d74" strokeWidth="1" />
        )),
      )}
      {[52, 78].map((x) => (
        <text key={x} x={x + 11} y={498} textAnchor="middle" fontSize="16" fill="#3b4378">
          ♿
        </text>
      ))}

      {/* north arrow and note */}
      <g transform="translate(940 690)">
        <path d="M 0 -14 L 7 6 L 0 1 L -7 6 Z" fill="#2b2421" />
        <text y="-18" textAnchor="middle" fontSize="12" fill="#2b2421">
          N
        </text>
      </g>
      <text x="30" y="16" fontSize="13" fill="#5c5049" style={{ fontFamily: 'var(--font-sans)' }}>
        Indicative layout · not to scale
      </text>
    </svg>
  )
}
